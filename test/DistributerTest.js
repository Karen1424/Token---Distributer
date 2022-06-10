
const Distributer = artifacts.require("Distributer");
const FastToken = artifacts.require("FastToken");
const truffleAssert = require('truffle-assertions');

contract("Distributer", async (accounts) => {

    const owner = accounts[0];
    const founder = accounts[1];
    const employee1 = accounts[2];
    const employee2 = accounts[3];
    const buyer = accounts[4];
    let distributer;
    let fastToken;
    let foundersTotalSupply = BigInt(400000) * BigInt(10 ** 18);
    let employeesTotalSupply = BigInt(200000) * BigInt(10 ** 18);
    let soldTokensTotalSupply = BigInt(400000) * BigInt(10 ** 18);
    
    before(async () => {

        distributer = await Distributer.deployed({ from : owner });
        fastToken = await FastToken.at(await distributer.fastToken());
    });

    after(async () => {

    });

    _advanceBlock = async () => {

        return new Promise((resolve, reject) => {
            web3.eth.currentProvider.send({
                jsonrpc: "2.0",
                method: "evm_mine",
                id: new Date().getTime()
            }, (err, result) => {
                if (err) { return reject(err); }
                const newBlockHash = web3.eth.getBlock('latest').hash;
                return resolve(newBlockHash)
            });
        });
    }

    _advanceTime = async (time) => {

        return new Promise((resolve, reject) => {
            web3.eth.currentProvider.send({
                jsonrpc: "2.0",
                method: "evm_increaseTime",
                params: [time],
                id: new Date().getTime()
            }, (err, result) => {
                if (err) { return reject(err); }
                const newBlockHash = web3.eth.getBlock('latest').hash;
                return resolve(newBlockHash)
            });
        });
    }

    timeTravel = async (time) => {

        await _advanceTime(time);
        await _advanceBlock();
    }

    describe("Checking basic properties", async () => {

        it("Owner is correct", async () => {

            const address = await distributer.owner();
            assert.equal(address, owner);
        });

        it("Should be minted 1000000 FastToken to the distribution contract", async () => {

            const minted = BigInt(await fastToken.totalSupply());
            assert.equal(foundersTotalSupply, BigInt(await distributer.foundersTotalSupply()));
            assert.equal(employeesTotalSupply, BigInt(await distributer.employeesTotalSupply()));
            assert.equal(soldTokensTotalSupply, BigInt(await distributer.soldTokensTotalSupply()));
            assert.equal((foundersTotalSupply + employeesTotalSupply + soldTokensTotalSupply), minted);
        });
    });

    describe("Checking Founder Allocation type", async () => {

        let amount = BigInt(5000) * BigInt(10 ** 18);

        it("Only owner can add new founder allocation", async () => {
            
            await truffleAssert.fails(distributer.addFounder(founder, amount, { from : employee1 }));
        });

        it("Owner can add new founder", async () => {

            await distributer.addFounder(founder, amount, { from : owner });  
        });

        it("Immediately release must be 20 percent for founder", async () => {

            const user = await distributer.owners(founder);
            assert.equal(BigInt(user.totalAmount), amount);
            assert.equal(BigInt(user.claimed), amount / BigInt(5));
        });
        ///
        it("Checking that founder total supply is not decreased size of amount", async () => {

            const total = BigInt(await distributer.foundersTotalSupply());
            assert.notEqual(foundersTotalSupply,total);
        });

        it("The owner can not add founder if founder already exists", async () => {

            await truffleAssert.fails(distributer.addFounder(founder, amount));        
        });

        it("The owner can not add founder if dose not exists such as amount", async () => {

            const user = await distributer.owners(founder);
            const amount = BigInt(400001) * BigInt(10 ** 18);
            await truffleAssert.fails(distributer.addFounder(user, amount));
        });
    });
    
    describe("Checking Employee Allocation type", async () => {

        let amount = BigInt(1000) * BigInt(10 ** 18);
       
        it("Only owner can add new employee allocation", async () => {

            await truffleAssert.fails(distributer.addEmployee(employee1, amount, { from : employee2 }));
        });
        
        it("Owner can add new employee", async () => {

            await distributer.addEmployee(employee1, amount);  
        });

        it("Immediately release must be 10 percent for employee", async () => {

            const employee = await distributer.owners(employee1);
            assert.equal(BigInt(employee.totalAmount), amount);
            assert.equal(BigInt(employee.claimed), amount / BigInt(10));
        });

        it("Checking that employee total supply is not decreased size of amount", async () => {

            const total = BigInt(await distributer.employeesTotalSupply());
            assert.notEqual(employeesTotalSupply,total);
        });

        it("The owner can not add employee if employee already exists", async () => {

            const employee = await distributer.owners(employee1);
            await truffleAssert.fails(distributer.addEmployee(employee, amount));        
        });

        it("The owner can not add employee if dose not exists such as amount", async () => {

            const employee = await distributer.owners(employee1);
            const amount =  BigInt(200001) * BigInt(10 ** 18);
            await truffleAssert.fails(distributer.addEmployee(employee, amount));
        });
    });
   
    describe("Sold Tokens Management", async () => {

        it("The owner can not sale tokens, because sold tokens total supply is less than an amount", async () => {

            const amount = BigInt(400001) * BigInt(10 ** 18);
            await truffleAssert.fails(distributer.soldTokensManagement(buyer, amount));
        });
    });

    describe("Claim", async () => {
       
        it("The founder can not claim, because time is still frozen", async () => {

            await truffleAssert.fails(distributer.claim({ from : founder }));
        });
        
        it("The employee can not claim, because time is still frozen", async () => { 

            await truffleAssert.fails(distributer.claim({ from : employee1 }));
        });
        
        it("Claiming must be faield by another account", async () => {

            await truffleAssert.fails(distributer.claim({ from : buyer }));
        });
        /*
        it("Claiming by employee will be succsessful using time travel", async () => {
            let dayPerSecond = (180 * 86400) + 1;
            let month = 30 * 86400;
            await timeTravel(dayPerSecond);
            for (let i = 1; i < 10; ++i) {
                await timeTravel(month);
                await distributer.claim({ from : employee1 });
                let user = await distributer.owners(employee1);
                console.log(`${ i } mounths claimed: ${ user.claimed }, total amount: ${ user.totalAmount }`);
            }
            const result = await distributer.owners(employee1);
            console.log(`Employee claimed: ${ BigInt(result.claimed) }`); 
        });
    */
        /*
        it("Claiming by founder will be succsessful using time travel", async () => {
             
            let dayPerSecond = (730 * 86400) + 1;
            let month = 30 * 86400;
            await timeTravel(dayPerSecond);

            for (let i = 1; i < 5; ++i) {
                await timeTravel(month);
                await distributer.claim({ from : founder });
                let user = await distributer.owners(founder);
                console.log(`${ i } mounths claimed: ${ user.claimed }, total amount: ${ user.totalAmount }`);
            }
            const result = await distributer.owners(founder);
            console.log(`Founder claimed: ${ BigInt(result.claimed) }`);  
        });
    */
        /*
        it("The employee claim in random mounths", async () => {

            let dayPerSecond = (180 * 86400) + 1;
            let monthPerSecond = 30 * 86400;
            await timeTravel(dayPerSecond);

            let rand = Math.floor(Math.random() * 8) + 1;
            await timeTravel(rand * monthPerSecond);
            await distributer.claim({ from : employee1 });
            let user = await distributer.owners(employee1);
            console.log(`The employee claim in month ${ rand }: ${BigInt(user.claimed)}`);

            rand = Math.floor(Math.random() * 100) + 9;
            await timeTravel(rand * monthPerSecond);
            await distributer.claim({ from : employee1 });
            user = await distributer.owners(employee1);
            console.log(`The employee claim in month ${ rand }: ${BigInt(user.claimed)}`);
        });
    */
        /*
        it("The employee may claim all total amount after 9 months", async () => {

            let dayPerSecond = (180 * 86400) + 1;
            let monthPerSecond = 30 * 86400;
            await timeTravel(dayPerSecond);

            let rand = Math.floor(Math.random() * 10) + 10;
            await timeTravel(rand * monthPerSecond);
            await distributer.claim({ from : employee1 });
            let user = await distributer.owners(employee1);
            console.log(`The employee claim in month ${ rand }: ${ BigInt(user.claimed) }`);
        });
    */
        /*
        it("The founder claim in random mounths", async () => {

            let dayPerSecond = (730 * 86400) + 1;
            let monthPerSecond = 30 * 86400;
            await timeTravel(dayPerSecond);

            let rand = Math.floor(Math.random() * 3) + 1;
            await timeTravel(rand * monthPerSecond);
            await distributer.claim({ from : founder });
            let user = await distributer.owners(founder);
            console.log(`The founder claim in month ${ rand }: ${BigInt(user.claimed)}`);

            rand = Math.floor(Math.random() * 100) + 4;
            await timeTravel(rand * monthPerSecond);
            await distributer.claim({ from : founder });
            user = await distributer.owners(founder);
            console.log(`The founder claim in month ${ rand }: ${BigInt(user.claimed)}`);
        });
    */
        /*
        it("The founder may claim all total amount after 4 months", async () => {

            let dayPerSecond = (730 * 86400) + 1;
            let monthPerSecond = 30 * 86400;
            await timeTravel(dayPerSecond);

            let rand = Math.floor(Math.random() * 5) + 5;
            await timeTravel(rand * monthPerSecond);
            await distributer.claim({ from : founder });
            let user = await distributer.owners(founder);
            console.log(`The employee claim in month ${ rand }: ${ BigInt(user.claimed) }`);
        });
    */
    });
});  
