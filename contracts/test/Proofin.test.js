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

  describe("Listing Creation (Events, Restaurants, Salons)", function () {
    it("should allow creating a listing with valid timings and category", async function () {
      const now = await time.latest();
      const startTime = now + 3600;      // 9:00 AM equivalent
      const endTime = now + 28800;      // 4:00 PM equivalent
      const checkInStart = now + 5400;  // 9:30 AM equivalent
      const checkInEnd = now + 10800;   // 11:00 AM equivalent

      const tx = await proofin.connect(organizer).createEvent(
        "Monad Blitz Workshop",
        "EVENT",
        "Exclusive hands-on Web3 developer workshop on Monad Testnet",
        "Monad Hub, Hyderabad",
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        startTime,
        endTime,
        checkInStart,
        checkInEnd,
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
          "EVENT",
          DEPOSIT_AMOUNT,
          CAPACITY,
          startTime,
          checkInEnd,
          0
        );

      const ev = await proofin.getEventDetails(1);
      expect(ev.title).to.equal("Monad Blitz Workshop");
      expect(ev.category).to.equal("EVENT");
      expect(ev.timings.checkInStartTime).to.equal(checkInStart);
      expect(ev.timings.checkInEndTime).to.equal(checkInEnd);
    });
  });

  describe("Check-In Window Enforcement & Automatic Deposit Release", function () {
    let eventId;
    let startTime;
    let endTime;
    let checkInStart;
    let checkInEnd;

    beforeEach(async function () {
      const now = await time.latest();
      startTime = now + 3600;       // Event Start (e.g. 9:00 AM)
      endTime = now + 28800;       // Event End (e.g. 4:00 PM)
      checkInStart = now + 5400;   // Check-in Start (e.g. 9:30 AM)
      checkInEnd = now + 10800;    // Check-in End (e.g. 11:00 AM)

      await proofin.connect(organizer).createEvent(
        "Monad Blitz Workshop",
        "EVENT",
        "Workshop",
        "Hyderabad",
        "",
        startTime,
        endTime,
        checkInStart,
        checkInEnd,
        DEPOSIT_AMOUNT,
        50,
        0
      );
      eventId = 1;
      await proofin.connect(attendee1).reserveSpot(eventId, { value: DEPOSIT_AMOUNT });
    });

    it("should revert if user tries to check in BEFORE check-in window opens (< 9:30 AM)", async function () {
      await expect(
        proofin.connect(attendee1).checkIn(eventId)
      ).to.be.revertedWithCustomError(proofin, "CheckInNotOpen");
    });

    it("should allow check-in and refund deposit when inside check-in window (9:30 AM - 11:00 AM)", async function () {
      await time.increaseTo(checkInStart + 100); // 9:31 AM

      const balanceBefore = await ethers.provider.getBalance(attendee1.address);
      const tx = await proofin.connect(attendee1).checkIn(eventId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      await expect(tx)
        .to.emit(proofin, "CheckedIn")
        .withArgs(eventId, attendee1.address, await time.latest());

      const res = await proofin.getReservation(eventId, attendee1.address);
      expect(res.status).to.equal(2); // CHECKED_IN

      const balanceAfter = await ethers.provider.getBalance(attendee1.address);
      expect(balanceAfter).to.equal(balanceBefore + DEPOSIT_AMOUNT - gasUsed);
    });

    it("should revert if user tries to check in AFTER check-in window closes (> 11:00 AM)", async function () {
      await time.increaseTo(checkInEnd + 10); // Past 11:00 AM

      await expect(
        proofin.connect(attendee1).checkIn(eventId)
      ).to.be.revertedWithCustomError(proofin, "CheckInWindowPassed");
    });

    it("should forfeit deposit to organizer if user fails to check in before 11:00 AM", async function () {
      await time.increaseTo(checkInEnd + 100);

      const organizerBalBefore = await ethers.provider.getBalance(organizer.address);
      const tx = await proofin.connect(organizer).processNoShow(eventId, attendee1.address);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const res = await proofin.getReservation(eventId, attendee1.address);
      expect(res.status).to.equal(3); // NO_SHOW

      const organizerBalAfter = await ethers.provider.getBalance(organizer.address);
      expect(organizerBalAfter).to.equal(organizerBalBefore + DEPOSIT_AMOUNT - gasUsed);
    });
  });
});
