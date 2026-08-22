const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Proofin Smart Contract", function () {
  let proofin;
  let owner;
  let organizer;
  let attendee1;
  let attendee2;
  let communityPool;

  const DEPOSIT_AMOUNT = ethers.parseEther("0.01"); // 0.01 MON
  const CAPACITY = 50;

  beforeEach(async function () {
    [owner, organizer, attendee1, attendee2, communityPool] = await ethers.getSigners();

    const ProofinFactory = await ethers.getContractFactory("Proofin");
    proofin = await ProofinFactory.deploy(communityPool.address);
    await proofin.waitForDeployment();
  });

  describe("Event Creation", function () {
    it("should allow an organizer to create an event with valid parameters", async function () {
      const now = await time.latest();
      const eventTime = now + 3600; // 1 hour from now
      const checkInDeadline = now + 3000; // 50 mins from now

      const tx = await proofin.connect(organizer).createEvent(
        "Monad Blitz Workshop",
        "Exclusive hands-on Web3 developer workshop on Monad Testnet",
        "Monad Hub, Hyderabad",
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        eventTime,
        checkInDeadline,
        DEPOSIT_AMOUNT,
        CAPACITY,
        0 // NoShowPolicy.ORGANIZER
      );

      await expect(tx)
        .to.emit(proofin, "EventCreated")
        .withArgs(
          1,
          organizer.address,
          "Monad Blitz Workshop",
          DEPOSIT_AMOUNT,
          CAPACITY,
          eventTime,
          checkInDeadline,
          0
        );

      const ev = await proofin.getEventDetails(1);
      expect(ev.title).to.equal("Monad Blitz Workshop");
      expect(ev.capacity).to.equal(CAPACITY);
      expect(ev.reservedCount).to.equal(0);
      expect(ev.active).to.be.true;
    });

    it("should revert if capacity is 0", async function () {
      const now = await time.latest();
      await expect(
        proofin.connect(organizer).createEvent(
          "Invalid Event",
          "Desc",
          "Loc",
          "",
          now + 3600,
          now + 3000,
          DEPOSIT_AMOUNT,
          0,
          0
        )
      ).to.be.revertedWithCustomError(proofin, "InvalidParameters");
    });
  });

  describe("Reservation & Commitment Locking", function () {
    let eventId;
    let eventTime;
    let checkInDeadline;

    beforeEach(async function () {
      const now = await time.latest();
      eventTime = now + 7200;
      checkInDeadline = now + 5400;

      await proofin.connect(organizer).createEvent(
        "Monad Blitz Workshop",
        "Workshop",
        "Hyderabad",
        "",
        eventTime,
        checkInDeadline,
        DEPOSIT_AMOUNT,
        2, // Small capacity of 2 for testing limits
        0
      );
      eventId = 1;
    });

    it("should allow a user to reserve a spot by locking exact deposit", async function () {
      const tx = await proofin.connect(attendee1).reserveSpot(eventId, {
        value: DEPOSIT_AMOUNT,
      });

      await expect(tx)
        .to.emit(proofin, "SpotReserved")
        .withArgs(eventId, attendee1.address, 1, DEPOSIT_AMOUNT, await time.latest());

      const res = await proofin.getReservation(eventId, attendee1.address);
      expect(res.spotNumber).to.equal(1);
      expect(res.status).to.equal(1); // RESERVED
      expect(res.depositAmount).to.equal(DEPOSIT_AMOUNT);

      const ev = await proofin.getEventDetails(eventId);
      expect(ev.reservedCount).to.equal(1);

      // Verify contract holds locked deposit
      expect(await ethers.provider.getBalance(await proofin.getAddress())).to.equal(DEPOSIT_AMOUNT);
    });

    it("should revert if wrong deposit amount is sent", async function () {
      const wrongDeposit = ethers.parseEther("0.005");
      await expect(
        proofin.connect(attendee1).reserveSpot(eventId, { value: wrongDeposit })
      ).to.be.revertedWithCustomError(proofin, "IncorrectDeposit");
    });

    it("should revert if user tries to reserve twice for same event", async function () {
      await proofin.connect(attendee1).reserveSpot(eventId, { value: DEPOSIT_AMOUNT });
      await expect(
        proofin.connect(attendee1).reserveSpot(eventId, { value: DEPOSIT_AMOUNT })
      ).to.be.revertedWithCustomError(proofin, "AlreadyReserved");
    });

    it("should revert when event is fully booked", async function () {
      await proofin.connect(attendee1).reserveSpot(eventId, { value: DEPOSIT_AMOUNT });
      await proofin.connect(attendee2).reserveSpot(eventId, { value: DEPOSIT_AMOUNT });

      const [, , , , , attendee3] = await ethers.getSigners();
      await expect(
        proofin.connect(attendee3).reserveSpot(eventId, { value: DEPOSIT_AMOUNT })
      ).to.be.revertedWithCustomError(proofin, "EventFull");
    });
  });

  describe("Check-In & Automatic Deposit Release", function () {
    let eventId;

    beforeEach(async function () {
      const now = await time.latest();
      await proofin.connect(organizer).createEvent(
        "Monad Blitz Workshop",
        "Workshop",
        "Hyderabad",
        "",
        now + 3600,
        now + 3000,
        DEPOSIT_AMOUNT,
        50,
        0
      );
      eventId = 1;
      await proofin.connect(attendee1).reserveSpot(eventId, { value: DEPOSIT_AMOUNT });
    });

    it("should verify attendance and refund the exact deposit back to attendee", async function () {
      const balanceBefore = await ethers.provider.getBalance(attendee1.address);

      const tx = await proofin.connect(attendee1).checkIn(eventId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      await expect(tx)
        .to.emit(proofin, "CheckedIn")
        .withArgs(eventId, attendee1.address, await time.latest());

      await expect(tx)
        .to.emit(proofin, "DepositReleased")
        .withArgs(eventId, attendee1.address, DEPOSIT_AMOUNT, await time.latest());

      const res = await proofin.getReservation(eventId, attendee1.address);
      expect(res.status).to.equal(2); // CHECKED_IN

      const ev = await proofin.getEventDetails(eventId);
      expect(ev.checkedInCount).to.equal(1);

      // Verify balance increased back by deposit minus gas
      const balanceAfter = await ethers.provider.getBalance(attendee1.address);
      expect(balanceAfter).to.equal(balanceBefore + DEPOSIT_AMOUNT - gasUsed);
    });

    it("should revert if user attempts to check in twice (prevent double refund)", async function () {
      await proofin.connect(attendee1).checkIn(eventId);
      await expect(
        proofin.connect(attendee1).checkIn(eventId)
      ).to.be.revertedWithCustomError(proofin, "AlreadyCheckedIn");
    });

    it("should revert if caller has no reservation", async function () {
      await expect(
        proofin.connect(attendee2).checkIn(eventId)
      ).to.be.revertedWithCustomError(proofin, "ReservationNotFound");
    });
  });

  describe("No-Show Processing", function () {
    let eventId;
    let checkInDeadline;

    beforeEach(async function () {
      const now = await time.latest();
      checkInDeadline = now + 1000;
      await proofin.connect(organizer).createEvent(
        "Monad Blitz Workshop",
        "Workshop",
        "Hyderabad",
        "",
        now + 2000,
        checkInDeadline,
        DEPOSIT_AMOUNT,
        50,
        0 // ORGANIZER policy
      );
      eventId = 1;
      await proofin.connect(attendee1).reserveSpot(eventId, { value: DEPOSIT_AMOUNT });
    });

    it("should revert if trying to process no-show before deadline", async function () {
      await expect(
        proofin.connect(organizer).processNoShow(eventId, attendee1.address)
      ).to.be.revertedWithCustomError(proofin, "DeadlineNotPassed");
    });

    it("should forfeit deposit to organizer after deadline passes", async function () {
      await time.increaseTo(checkInDeadline + 100);

      const organizerBalanceBefore = await ethers.provider.getBalance(organizer.address);
      const tx = await proofin.connect(organizer).processNoShow(eventId, attendee1.address);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const res = await proofin.getReservation(eventId, attendee1.address);
      expect(res.status).to.equal(3); // NO_SHOW

      const ev = await proofin.getEventDetails(eventId);
      expect(ev.noShowCount).to.equal(1);

      const organizerBalanceAfter = await ethers.provider.getBalance(organizer.address);
      expect(organizerBalanceAfter).to.equal(
        organizerBalanceBefore + DEPOSIT_AMOUNT - gasUsed
      );
    });

    it("should not allow a checked-in user to be marked as no-show", async function () {
      await proofin.connect(attendee1).checkIn(eventId);
      await time.increaseTo(checkInDeadline + 100);

      await expect(
        proofin.connect(organizer).processNoShow(eventId, attendee1.address)
      ).to.be.revertedWithCustomError(proofin, "AlreadySettled");
    });
  });
});
