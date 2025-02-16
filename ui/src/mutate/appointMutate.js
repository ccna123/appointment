import { gql } from "@apollo/client";

const CONFIRM_APPOINTMENT = gql`
  mutation confirmAppointment($id: ID!) {
    updateAppointmentStatus(id: $id, status: "Confirmed") {
      user {
        name
        appointments {
          course
          coach
          location
          date
          time
        }
      }
    }
  }
`;

const ADD_APPOINTMENT = gql`
  mutation addAppointment(
    $userId: ID!
    $date: String!
    $time: String!
    $location: String!
    $course: String!
    $coach: String!
    $notes: String!
  ) {
    addAppointment(
      userId: $userId
      date: $date
      time: $time
      location: $location
      course: $course
      coaches: $coach
      notes: $notes
    ) {
      user {
        name
      }
    }
  }
`;

const EDIT_APPOINTMENT = gql`
  mutation editAppointment(
    $itemId: ID!
    $course: String
    $coach: String
    $date: String
    $time: String
    $location: String
    $notes: String
  ) {
    editAppointment(
      itemId: $itemId
      course: $course
      coaches: $coach
      date: $date
      time: $time
      location: $location
      notes: $notes
    ) {
      course
      location
      date
      time
      status
      notes
    }
  }
`;

const DELETE_APPOINTMENT = gql`
  mutation deleteAppointment($id: ID!) {
    deleteAppointment(id: $id) {
      course
      location
      date
      time
      status
      notes
    }
  }
`;

export {
  CONFIRM_APPOINTMENT,
  ADD_APPOINTMENT,
  EDIT_APPOINTMENT,
  DELETE_APPOINTMENT,
};
