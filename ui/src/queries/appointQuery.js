import { gql } from "@apollo/client";

const GET_APPOINTMENTS = gql`
  query getAppointment {
    appointments {
      id
      course
      location
      coach
      date
      time
      status
      notes
      user {
        name
      }
    }
  }
`;

const GET_SINGLE_APPOINTMENTS = gql`
  query getSingleAppointment($id: ID!) {
    appointment(id: $id) {
      id
      course
      location
      coach
      date
      time
      notes
      status
      user {
        name
      }
    }
  }
`;

export { GET_APPOINTMENTS, GET_SINGLE_APPOINTMENTS };
