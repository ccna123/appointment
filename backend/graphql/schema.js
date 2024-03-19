const { PrismaClient } = require("@prisma/client");
const { User, Appointments } = require("../data");

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
} = require("graphql");

const prisma = new PrismaClient();

//user type

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    role: { type: GraphQLString },
    appointments: {
      type: new GraphQLList(AppointmentType),
      resolve: async (parent, args) => {
        const records = await prisma.appointment.findMany({
          where: { userId: parseInt(parent.id) },
        });
        return records;
      },
    },
  }),
});

//appointment type

const AppointmentType = new GraphQLObjectType({
  name: "Appointment",
  fields: () => ({
    id: { type: GraphQLID },
    userId: { type: GraphQLID },
    date: { type: GraphQLString },
    time: { type: GraphQLString },
    location: { type: GraphQLString },
    course: { type: GraphQLString },
    coach: { type: GraphQLString },
    status: { type: GraphQLString },
    notes: { type: GraphQLString },
    user: {
      type: UserType,
      resolve: async (parent, args) => {
        const record = await prisma.user.findFirst({
          where: { id: parseInt(parent.userId) },
        });
        return record;
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: () => ({
    appointments: {
      type: new GraphQLList(AppointmentType),
      resolve: async () => {
        return await prisma.appointment.findMany();
      },
    },
    appointment: {
      type: AppointmentType,
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args) => {
        return await prisma.appointment.findFirst({
          where: { id: parseInt(args.id) },
        });
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve: async () => {
        return await prisma.user.findMany();
      },
    },

    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args) => {
        return await prisma.user.findFirst({
          where: { id: parseInt(args.id) },
        });
      },
    },
  }),
});

//mutation type
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    //add user
    addUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        role: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const newUser = prisma.user.create({
          data: {
            name: args.name,
            email: args.email,
            password: args.password,
            role: args.role,
          },
        });
        return newUser;
      },
    },

    //delete user
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        const deletedUser = await prisma.user.delete({
          where: { id: parseInt(args.id) },
        });
        return deletedUser;
      },
    },

    //add new appointment
    addAppointment: {
      type: AppointmentType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        date: { type: new GraphQLNonNull(GraphQLString) },
        time: { type: new GraphQLNonNull(GraphQLString) },
        location: { type: new GraphQLNonNull(GraphQLString) },
        course: { type: new GraphQLNonNull(GraphQLString) },
        coaches: {
          type: new GraphQLNonNull(GraphQLString),
        },
        status: {
          type: new GraphQLNonNull(GraphQLString),
          defaultValue: "Waiting",
        },
        notes: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const newAppointment = await prisma.appointment.create({
          data: {
            userId: parseInt(args.userId),
            date: args.date,
            time: args.time,
            location: args.location,
            course: args.course,
            coach: args.coaches,
            status: args.status,
            notes: args.notes,
          },
        });
        return newAppointment;
      },
    },

    //delete appointment
    deleteAppointment: {
      type: AppointmentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        const deletedAppointment = await prisma.appointment.delete({
          where: { id: parseInt(args.id) },
        });
        return deletedAppointment;
      },
    },

    //update appointment
    updateAppointment: {
      type: AppointmentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        userId: { type: new GraphQLNonNull(GraphQLID) },
        course: { type: GraphQLString },
        coaches: {
          type: new GraphQLNonNull(GraphQLString),
        },
        date: { type: GraphQLString },
        time: { type: GraphQLString },
        location: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const updatedAppointment = await prisma.appointment.update({
          where: { id: parseInt(args.id), userId: parseInt(args.userId) },
          data: {
            course: args.course,
            coach: args.coaches,
            date: args.date,
            time: args.time,
            location: args.location,
          },
        });
        return updatedAppointment;
      },
    },

    //edit appointment status
    updateAppointmentStatus: {
      type: AppointmentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        status: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (parent, args) => {
        const updatedAppointment = await prisma.appointment.update({
          where: { id: parseInt(args.id) },
          data: {
            status: args.status,
          },
        });
        return updatedAppointment;
      },
    },

    //delete appointment
    deleteAppointment: {
      type: AppointmentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        const deletedAppointment = await prisma.appointment.delete({
          where: { id: parseInt(args.id) },
        });
        return deletedAppointment;
      },
    },

    //edit appointment
    editAppointment: {
      type: AppointmentType,
      args: {
        itemId: { type: new GraphQLNonNull(GraphQLID) },
        course: { type: GraphQLString },
        coaches: { type: GraphQLString },
        date: { type: GraphQLString },
        time: { type: GraphQLString },
        location: { type: GraphQLString },
        notes: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const updatedAppointment = await prisma.appointment.update({
          where: { id: parseInt(args.itemId) },
          data: {
            course: args.course,
            coach: args.coaches,
            date: args.date,
            time: args.time,
            location: args.location,
            notes: args.notes,
          },
        });
        return updatedAppointment;
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
