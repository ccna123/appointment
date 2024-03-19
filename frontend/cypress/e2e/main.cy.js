/// <reference types="Cypress" />

describe("test main page", () => {
  beforeEach(() => {
    cy.viewport(650, 850);
    cy.visit("http://localhost:3000/main", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "user",
          JSON.stringify({
            user: { id: 1, role: "guest", name: "mit" },
          })
        );
      },
    });
  });
  it("should display username", () => {
    const userName = JSON.parse(localStorage.getItem("user")).user.name;
    cy.get("a").should("contain", userName);
  });
  it("should display form", () => {
    cy.get("input[type=date]").should("exist");
    cy.get("select").should("have.length", 2);
    cy.get("textarea").should("exist");
    cy.get("button").should("contain", "Pick appointment");
  });
  it("should display toast for empty field", () => {
    cy.get("button").should("contain", "Pick appointment").click();
    cy.get(".Toastify__toast--warning").should(
      "contain",
      "Please fill all the fields"
    );
  });
  it("should display toast when adding new appointment", () => {
    cy.get("input[type=date]").type("2024-04-24");
    cy.get(".grid-cols-3 > :nth-child(1)").click();
    cy.get("select").eq(0).select("Coding Challenge");
    cy.get("select").eq(1).select("ABC Hotel");
    cy.get("textarea").type("This is test note");

    cy.intercept("POST", `/api`, {
      statusCode: 201,
    }).as("making_appoint");

    cy.get("button").should("contain", "Pick appointment").click();
    cy.get(".Toastify__toast--success").should(
      "contain",
      "Make appointment successfully"
    );
  });
});
