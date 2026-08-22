// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Proofin
 * @notice Web3 Reservation & Commitment Platform on Monad Testnet.
 * Users reserve limited spots by locking a MON commitment deposit, get checked in on-chain,
 * and automatically receive their deposit back when they attend.
 *
 * Tagline: Reserve it. Show up. Get your deposit back.
 */
contract Proofin is ReentrancyGuard, Ownable {

    // --- Enums & Structs ---

    enum NoShowPolicy {
        ORGANIZER,      // Forfeited deposits go to event organizer
        COMMUNITY_POOL  // Forfeited deposits go to community pool / platform
    }

    enum ReservationStatus {
        NONE,
        RESERVED,
        CHECKED_IN,
        NO_SHOW
    }

    struct EventInfo {
        uint256 id;
        address payable organizer;
        string title;
        string description;
        string location;
        string imageURI;
        uint64 eventTime;
        uint64 checkInDeadline;
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
        uint256 depositAmount,
        uint32 capacity,
        uint64 eventTime,
        uint64 checkInDeadline,
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
    error CheckInDeadlinePassed();
    error ReservationNotFound();
    error AlreadyCheckedIn();
    error AlreadySettled();
    error DeadlineNotPassed();
    error Unauthorized();
    error InvalidParameters();
    error TransferFailed();

    constructor(address payable _communityPool) Ownable(msg.sender) {
        communityPool = _communityPool != address(0) ? _communityPool : payable(msg.sender);
    }

    // --- External / Public Functions ---

    /**
     * @notice Create a new reservation event with required commitment deposit.
     */
    function createEvent(
        string calldata title,
        string calldata description,
        string calldata location,
        string calldata imageURI,
        uint64 eventTime,
        uint64 checkInDeadline,
        uint256 depositAmount,
        uint32 capacity,
        NoShowPolicy policy
    ) external returns (uint256 eventId) {
        if (capacity == 0) revert InvalidParameters();
        if (checkInDeadline > eventTime + 1 days) revert InvalidParameters();

        eventId = _nextEventId++;
        EventInfo storage ev = events[eventId];
        ev.id = eventId;
        ev.organizer = payable(msg.sender);
        ev.title = title;
        ev.description = description;
        ev.location = location;
        ev.imageURI = imageURI;
        ev.eventTime = eventTime;
        ev.checkInDeadline = checkInDeadline;
        ev.depositAmount = depositAmount;
        ev.capacity = capacity;
        ev.active = true;
        ev.policy = policy;

        emit EventCreated(
            eventId,
            msg.sender,
            title,
            depositAmount,
            capacity,
            eventTime,
            checkInDeadline,
            policy
        );
    }

    /**
     * @notice Reserve a spot in an event by locking the required MON deposit.
     * @param eventId The ID of the event to reserve.
     */
    function reserveSpot(uint256 eventId) external payable nonReentrant {
        EventInfo storage ev = events[eventId];
        if (ev.id == 0) revert EventNotFound();
        if (!ev.active) revert EventInactive();
        if (block.timestamp > ev.checkInDeadline) revert CheckInDeadlinePassed();
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
     * @notice Check in at the event on-chain and automatically release the locked deposit back to caller.
     * @dev Enforces caller is the reservation owner. Uses Checks-Effects-Interactions pattern.
     * @param eventId The ID of the event.
     */
    function checkIn(uint256 eventId) external nonReentrant {
        EventInfo storage ev = events[eventId];
        if (ev.id == 0) revert EventNotFound();

        Reservation storage res = reservations[eventId][msg.sender];
        if (res.status == ReservationStatus.NONE) revert ReservationNotFound();
        if (res.status == ReservationStatus.CHECKED_IN) revert AlreadyCheckedIn();
        if (res.status == ReservationStatus.NO_SHOW) revert AlreadySettled();
        if (block.timestamp > ev.checkInDeadline + 2 hours) revert CheckInDeadlinePassed();

        // Update state before external transfer (CEI)
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
     * @notice Process no-show after the check-in deadline has passed.
     * @param eventId The event ID.
     * @param attendee The address of the attendee who failed to check in.
     */
    function processNoShow(uint256 eventId, address attendee) external nonReentrant {
        EventInfo storage ev = events[eventId];
        if (ev.id == 0) revert EventNotFound();
        if (block.timestamp <= ev.checkInDeadline) revert DeadlineNotPassed();

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

    /**
     * @notice Batch process no-shows for an event.
     */
    function batchProcessNoShows(uint256 eventId, address[] calldata attendees) external nonReentrant {
        EventInfo storage ev = events[eventId];
        if (ev.id == 0) revert EventNotFound();
        if (block.timestamp <= ev.checkInDeadline) revert DeadlineNotPassed();

        address payable recipient = (ev.policy == NoShowPolicy.ORGANIZER) ? ev.organizer : communityPool;
        uint256 totalDeposit = 0;

        for (uint256 i = 0; i < attendees.length; i++) {
            address attendee = attendees[i];
            Reservation storage res = reservations[eventId][attendee];
            if (res.status == ReservationStatus.RESERVED) {
                res.status = ReservationStatus.NO_SHOW;
                ev.noShowCount += 1;
                totalDeposit += res.depositAmount;
                emit NoShowProcessed(eventId, attendee, res.depositAmount, recipient, uint64(block.timestamp));
            }
        }

        if (totalDeposit > 0) {
            (bool success, ) = recipient.call{value: totalDeposit}("");
            if (!success) revert TransferFailed();
        }
    }

    /**
     * @notice Organizer can toggle active status of an event.
     */
    function setEventActive(uint256 eventId, bool active) external {
        EventInfo storage ev = events[eventId];
        if (ev.id == 0) revert EventNotFound();
        if (msg.sender != ev.organizer && msg.sender != owner()) revert Unauthorized();

        ev.active = active;
        emit EventStatusToggled(eventId, active);
    }

    /**
     * @notice Admin update of community pool address.
     */
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

    // Allow contract to receive native MON
    receive() external payable {}
}
