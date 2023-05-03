import { notFoundError } from '@/errors';
import { badRequest } from '@/errors/bad-request';
import { overCapacityError} from '@/errors/overcapacity-error';
import bookingRepository from '@/repositories/booking-repository/booking';
import enrollmentRepository from '@/repositories/enrollment-repository';
import roomRepository from '@/repositories/room-repository/room';
import ticketsRepository from '@/repositories/tickets-repository';

async function checkEnrollmentTicket(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw overCapacityError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw overCapacityError();
  }
}

async function checkValidBooking(roomId: number) {
  const room = await roomRepository.findById(roomId);
  const bookings = await bookingRepository.findByRoomId(roomId);

  if (!room) throw notFoundError();
  if (room.capacity <= bookings.length) throw overCapacityError();
}

async function getBooking(userId: number) {
  const booking = await bookingRepository.findByUserId(userId);
  if (!booking) throw notFoundError();

  return booking;
}

async function bookingRoomById(userId: number, roomId: number) {
  if (!roomId) throw badRequest();

  await checkEnrollmentTicket(userId);
  await checkValidBooking(roomId);

  return bookingRepository.create({ roomId, userId });
}

async function changeBookingRoomById(userId: number, roomId: number) {
  if (!roomId) throw badRequest();

  await checkValidBooking(roomId);
  const booking = await bookingRepository.findByUserId(userId);

  if (!booking || booking.userId !== userId) throw overCapacityError();

  return bookingRepository.upsertBooking({
    id: booking.id,
    roomId,
    userId,
  });
}

const bookingService = {
  bookingRoomById,
  getBooking,
  changeBookingRoomById,
  checkEnrollmentTicket,
  checkValidBooking,
};

export default bookingService;