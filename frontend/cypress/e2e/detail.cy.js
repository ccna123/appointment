/// <reference types="Cypress" />
describe("template spec", () => {
  beforeEach(() => {
    cy.intercept("GET", "http://localhost:4000/graphql", (req) => {
      if (req.body && req.body.operationName === "getAppointment") {
        req
          .reply({
            statusCode: 200,
            fixture: "appointDetail",
          })
          .as("making_appoint");
      }
    }).as("making_appoint");

    cy.window().then((win) => {
      cy.stub(win, "localStorage").returns({
        getItem: () =>
          JSON.stringify({
            user: {
              id: 1,
            },
          }),
      });
    });
    cy.visit("/detail/1");
    cy.viewport(600, 800);
  });
  it("display appoint detail", () => {});
});
