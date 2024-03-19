/// <reference types="Cypress" />

describe("template spec", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  context("Login form submission", () => {
    it("should display form", () => {
      cy.get("h1").should("contain", "Login");
      cy.get("input[type='email']").should(
        "have.attr",
        "placeholder",
        "Email..."
      );
      cy.get("input[type='password']").should(
        "have.attr",
        "placeholder",
        "Password..."
      );
      cy.get("button").should("contain", "Login");
    });
    it('should display "Invalid credentials" when input empty or wrong value', () => {
      cy.intercept("POST", `${Cypress.env("REACT_APP_BACKEND_URL")}login`, {
        body: {
          status: 401,
          mess: "Invalid credentials",
        },
      }).as("login");
      cy.get("button").click();
      cy.wait("@login");
      cy.get(".text-red-500").should("contain", "Invalid credentials");
    });

    it('should display "Logged in" when right value is input', () => {
      cy.intercept("POST", "http://localhost:4000/login", {
        statusCode: 200,
        body: {
          mess: "Logged in",
          status: 200,
        },
      }).as("login");
      cy.get("button").click();
      cy.wait("@login");
      cy.get(".text-green-500").should("contain", "Logged in");
    });
  });
});
