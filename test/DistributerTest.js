const Distributer = artifacts.require("Distributer");

contract("Distributer", (accounts) => {
    let distributer;

    beforeEach("Deploye contract", async () => {
        distributer = await Distributer.deployed();
    });
    const founder = accounts[1];
    const amount = 10000;
    it("Add Founders", async () => {
        await distributer.addFounder(founder,amount);
        console.log("Founder added");
    });

    it("Add Employee", async () => {
        await distributer.addEmployee(accounts[3],50000);
        console.log("Employee added")
    });
  
    it("sold Tokens Management", async () => {
       await distributer.soldTokensManagement(accounts[3],1000);
       
    });

    it("Current Status", async () => {
        const status = await distributer.currentStatus(accounts[3],{from : accounts[3]});
        console.log("Owner Current status", status);
    });
//
   // it("Claim", async () => {
   //     const status = await distributer.claim({from : accounts[3]});
   // }); 
});