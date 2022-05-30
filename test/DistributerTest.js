const Distributer = artifacts.require("Distributer");

contract("Distributer", (accounts) => {
    let distributer;

    beforeEach("Deploye contract", async () => {
        distributer = await Distributer.deployed();
    });

    it("Add Founders", async () => {
        await distributer.addFounder(founder,amount);
        console.log("Founder added");
    });

    it("Add Employee", async () => {
        await distributer.addEmployee(accounts[3],50000);
        console.log("Employee added")
    });

    it("sold Tokens Management", async () => {
        await distributer.soldTokensManagement(accounts[9],1500);
    });

    it("Current Status", async () => {
        const status = await distributer.currentStatus(accounts[3]);
        console.log("Owner Current status", status);
    });

    it("Owner To Use - should throw the exeption becouse are froozen", async () => {
        const status = await distributer.ownersToUse({from : accounts[3]});
        console.log("Owner Current status", status);
    }); 
});