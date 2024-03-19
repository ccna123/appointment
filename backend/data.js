const User = [
  {
    id: 1,
    name: "mit",
    email: "mit@abc.com",
    password: "123",
    role: "guest",
  },
  {
    id: 2,
    name: "scott",
    email: "scott@abc.com",
    password: "123",
    role: "guest",
  },
  {
    id: 3,
    name: "thanh",
    email: "thanh@abc.com",
    password: "123",
    role: "admin",
  },
];

const Appointments = [
  {
    id: 1,
    userId: 1,
    date: "2021-01-01",
    time: "12:00",
    location: "City Hotel",
    course: "Coding Challenge",
    coach: "Mr John Doe",
    status: "confirmed",
  },
  {
    id: 2,
    userId: 1,
    date: "2021-03-01",
    time: "12:30",
    location: "City Library",
    course: "Coding Challenge 1",
    coach: "Mr Mary Doe",
    status: "confirmed",
  },
  {
    id: 3,
    userId: 2,
    date: "2023-01-01",
    time: "17:00",
    location: "School",
    course: "Programming Basics",
    coach: "Mr Sample",
    status: "waiting",
  },
  {
    id: 4,
    userId: 3,
    date: "2021-10-22",
    time: "16:30",
    location: "Statdium",
    course: "Soccer",
    coach: "Mrs Jane",
    status: "confirmed",
  },
];

module.exports = { User, Appointments };
