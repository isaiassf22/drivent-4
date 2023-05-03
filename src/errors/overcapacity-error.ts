import { ApplicationError } from '@/protocols';

export function overCapacityError(): ApplicationError {
  return {
    name: 'CannotBookingError',
    message: 'Cannot booking this room! Overcapacity!',
  };
}