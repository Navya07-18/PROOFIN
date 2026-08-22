// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Proofin
 * @notice Web3 Reservation & Commitment Platform on Monad Testnet for Events, Restaurants, and Salons.
 * Users reserve spots by locking a MON commitment deposit, check in within a strict time window,
 * and automatically get their deposit refunded. No-shows forfeit their deposit.
 *
 * Tagline: Reserve it. Show up. Get your deposit back.
 */
contract Proofin is ReentrancyGuard, Ownable {

    enum NoShowPolicy {
        ORGANIZER,      // Forfeited deposits go to event organizer/business owner
        COMMUNITY_POOL  // Forfeited deposits go to community pool / platform
    }

    enum ReservationStatus {
        NONE,
        RESERVED,
        CHECKED_IN,
        NO_SHOW
    }

    struct EventTimings {
        uint64 startTime;        // e.g. 9:00 AM
        uint64 endTime;          // e.g. 4:00 PM
        uint64 checkInStartTime;// e.g. 9:30 AM
        uint64 checkInEndTime;  // e.g. 11:00 AM
    }

    struct EventInfo {
        uint256 id;
        address payable organizer;
        string title;
        string category; // "EVENT", "RESTAURANT", "SALON"
        string description;
        string location;
        string imageURI;
        EventTimings timings;
        uint256 depositAmount;
        uint32 capacity;
        uint32 reservedCount;
        uint32 checkedInCount;
        uint32 noShowCount;
        bool active;
        NoShowPolicy policy;
    }

    struct Reservation {
        uint256 eventId;
        uint32 spotNumber;
        address attendee;
        uint256 depositAmount;
        uint64 reservedAt;
        ReservationStatus status;
    }

    // --- State Variables ---

    uint256 private _nextEventId = 1;
    address payable public communityPool;

    // eventId => EventInfo
    mapping(uint256 => EventInfo) public events;

    // eventId => attendee address => Reservation
    mapping(uint256 => mapping(address => Reservation)) public reservations;

    // eventId => list of attendee addresses
    mapping(uint256 => address[]) private _eventAttendees;

    // attendee address => list of event IDs reserved
    mapping(address => uint256[]) private _userReservations;

    // --- Events ---

    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        string title,
        string category,
        uint256 depositAmount,
        uint32 capacity,
        uint64 startTime,
        uint64 checkInEndTime,
        NoShowPolicy policy
    );

    event SpotReserved(
        uint256 indexed eventId,
        address indexed attendee,
        uint32 spotNumber,
        uint256 depositAmount,
        uint64 timestamp
    );

    event CheckedIn(
        uint256 indexed eventId,
        address indexed attendee,
        uint64 timestamp
    );

    event DepositReleased(
        uint256 indexed eventId,
        address indexed attendee,
        uint256 amount,
        uint64 timestamp
    );

    event NoShowProcessed(
        uint256 indexed eventId,
        address indexed attendee,
        uint256 amount,
        address recipient,
        uint64 timestamp
    );

    event EventStatusToggled(uint256 indexed eventId, bool active);
    event CommunityPoolUpdated(address indexed newPool);

    // --- Custom Errors ---

    error EventNotFound();
    error EventInactive();
    error EventFull();
    error AlreadyReserved();
    error IncorrectDeposit(uint256 expected, uint256 received);
    error CheckInNotOpen();
    error CheckInWindowPassed();
    error ReservationNotFound();
    error AlreadyCheckedIn();
    error AlreadySettled();
    error CheckInWindowNotClosed();
    error Unauthorized();
    error InvalidParameters();
    error TransferFailed();

    constructor(address payable _communityPool) Ownable(msg.sender) {
        communityPool = _communityPool != address(0) ? _communityPool : payable(msg.sender);
    }

    /**
     * @notice Create a new reservation listing (Event, Restaurant, Salon).
     */
    function createEvent(
        string calldata title,
        string calldata category,
        string calldata description,
        string calldata location,
        string calldata imageURI,
        uint64 startTime,
        uint64 endTime,
        uint64 checkInStartTime,
        uint64 checkInEndTime,
        uint256 depositAmount,
        uint32 capacity,
        NoShowPolicy policy
    ) external returns (uint256 eventId) {
        if (capacity == 0) revert InvalidParameters();
        if (endTime <= startTime) revert InvalidParameters();
        if (checkInEndTime <= checkInStartTime) revert InvalidParameters();

        eventId = _nextEventId++;
        EventInfo storage ev = events[eventId];
        ev.id = eventId;
        ev.organizer = payable(msg.sender);
        ev.title = title;
        ev.category = category;
        ev.description = description;
        ev.location = location;
        ev.imageURI = imageURI;
        ev.timings = EventTimings(startTime, endTime, checkInStartTime, checkInEndTime);
        ev.depositAmount = depositAmount;
        ev.capacity = capacity;
        ev.active = true;
        ev.policy = policy;

        emit EventCreated(
            eventId,
            msg.sender,
            title,
            category,
            depositAmount,
            capacity,
            startTime,
            checkInEndTime,
            policy
        );
    }

    /**
     * @notice Reserve a spot or table/slot by locking exact required MON deposit.
     */
    function reserveSpot(uint256 eventId) external payable nonReentrant {
        EventInfo storage ev = events[eventId];
        if (ev.id == 0) revert EventNotFound();
        if (!ev.active) revert EventInactive();
        if (block.timestamp > ev.timings.checkInEndTime) revert CheckInWindowPassed();
        if (ev.reservedCount >= ev.capacity) revert EventFull();
        if (msg.value != ev.depositAmount) revert IncorrectDeposit(ev.depositAmount, msg.value);

        Reservation storage res = reservations[eventId][msg.sender];
        if (res.status != ReservationStatus.NONE) revert AlreadyReserved();

        ev.reservedCount += 1;
        uint32 spotNumber = ev.reservedCount;

        res.eventId = eventId;
        res.spotNumber = spotNumber;
        res.attendee = msg.sender;
        res.depositAmount = msg.value;
        res.reservedAt = uint64(block.timestamp);
        res.status = ReservationStatus.RESERVED;

        _eventAttendees[eventId].push(msg.sender);
        _userReservations[msg.sender].push(eventId);

        emit SpotReserved(eventId, msg.sender, spotNumber, msg.value, uint64(block.timestamp));
    }

    /**
     * @notice Check in within the strict check-in window [checkInStartTime, checkInEndTime].
     */
    function checkIn(uint256 eventId) external nonReentrant {
        EventInfo storage ev = events[eventId];
        if (ev.id == 0) revert EventNotFound();

        Reservation storage res = reservations[eventId][msg.sender];
        if (res.status == ReservationStatus.NONE) revert ReservationNotFound();
        if (res.status == ReservationStatus.CHECKED_IN) revert AlreadyCheckedIn();
        if (res.status == ReservationStatus.NO_SHOW) revert AlreadySettled();

        if (block.timestamp < ev.timings.checkInStartTime) revert CheckInNotOpen();
        if (block.timestamp > ev.timings.checkInEndTime) revert CheckInWindowPassed();

        res.status = ReservationStatus.CHECKED_IN;
        ev.checkedInCount += 1;

        uint256 refundAmount = res.depositAmount;

        emit CheckedIn(eventId, msg.sender, uint64(block.timestamp));

        if (refundAmount > 0) {
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            if (!success) revert TransferFailed();
            emit DepositReleased(eventId, msg.sender, refundAmount, uint64(block.timestamp));
        }
    }

    /**
     * @notice Process no-show AFTER checkInEndTime has passed.
     */
    function processNoShow(uint256 eventId, address attendee) external nonReentrant {
        EventInfo storage ev = events[eventId];
        if (ev.id == 0) revert EventNotFound();
        if (block.timestamp <= ev.timings.checkInEndTime) revert CheckInWindowNotClosed();

        Reservation storage res = reservations[eventId][attendee];
        if (res.status == ReservationStatus.NONE) revert ReservationNotFound();
        if (res.status != ReservationStatus.RESERVED) revert AlreadySettled();

        res.status = ReservationStatus.NO_SHOW;
        ev.noShowCount += 1;

        uint256 deposit = res.depositAmount;
        address payable recipient = (ev.policy == NoShowPolicy.ORGANIZER) ? ev.organizer : communityPool;

        emit NoShowProcessed(eventId, attendee, deposit, recipient, uint64(block.timestamp));

        if (deposit > 0) {
            (bool success, ) = recipient.call{value: deposit}("");
            if (!success) revert TransferFailed();
        }
    }

    function setEventActive(uint256 eventId, bool active) external {
        EventInfo storage ev = events[eventId];
        if (ev.id == 0) revert EventNotFound();
        if (msg.sender != ev.organizer && msg.sender != owner()) revert Unauthorized();

        ev.active = active;
        emit EventStatusToggled(eventId, active);
    }

    function setCommunityPool(address payable newPool) external onlyOwner {
        if (newPool == address(0)) revert InvalidParameters();
        communityPool = newPool;
        emit CommunityPoolUpdated(newPool);
    }

    // --- View Functions ---

    function getEventDetails(uint256 eventId) external view returns (EventInfo memory) {
        EventInfo memory ev = events[eventId];
        if (ev.id == 0) revert EventNotFound();
        return ev;
    }

    function getReservation(uint256 eventId, address attendee) external view returns (Reservation memory) {
        return reservations[eventId][attendee];
    }

    function getEventAttendees(uint256 eventId) external view returns (address[] memory) {
        return _eventAttendees[eventId];
    }

    function getUserReservations(address attendee) external view returns (uint256[] memory) {
        return _userReservations[attendee];
    }

    function getEventCount() external view returns (uint256) {
        return _nextEventId - 1;
    }

    receive() external payable {}
}
