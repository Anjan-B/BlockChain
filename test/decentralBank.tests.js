// const { assert } = require('console');

//const { assert } = require('console');

const Tether = artifacts.require("Tether");
const RWD = artifacts.require("RWD");
const DecentralBank = artifacts.require("DecentralBank");

require('chai')
.use(require('chai-as-promised'))
.should()

contract('DecentralBank', ([owner,customer]) => {
    let tether,rwd,decentralBank;

    function tokens(numbers){
        return web3.utils.toWei(numbers, 'Ether');
    }

    before(async () => {
        //load contract
        tether = await Tether.new()
        rwd = await RWD.new()
        decentralBank = await DecentralBank.new(rwd.address, tether.address)

        //Transfer all tokens to decentralbank 1 million
        await rwd.transfer(decentralBank.address, tokens('100000'))

        //Transfer 100 mock tether to Customer
        await tether.transfer(customer, tokens('100'), {from: owner})
    })

    describe('Mock Tether Deployment', async () => {
        it('Matches name sucessfully', async () => {
            const name = await tether.name()
            assert.equal(name, 'Mock Tether')
        })
    })

    describe('Reward Deployment', async () => {
        it('Matches name sucessfully', async () => {
            const name = await rwd.name()
            assert.equal(name, 'Reward token')
        })
    })

    describe('Decentral Bank Deployment', async () => {
        it('Matches name sucessfully', async () => {
            const name = await decentralBank.name()
            assert.equal(name, 'Decentral Bank')
        })

        it('contract has tokens ',async () => {
            let balance = await rwd.balanceOf(decentralBank.address)
            assert.equal(balance, tokens('100000'))
        })
    })

    describe('Yield Farming', async () => {
        it('Rewards token for staking', async () => {
            let result
            
            //check invester balance
            result = await tether.balanceOf(customer)
            assert.equal(result.toString(), tokens('100'), 'Customer mock wallet balance before staking')

            //Check Staking for customer
            await tether.approve(decentralBank.address, tokens('100'), {from: customer})
            await decentralBank.depositTokens(tokens('100'), {from: customer})

            //updated balance of customer
            result = await tether.balanceOf(customer)
            assert.equal(result.toString(), tokens('0'), 'Customer mock wallet balance after staking')

            //updated balance of Decentral bank
            //result = await decentralBank.stakingBalance(customer)
            result = await tether.balanceOf(decentralBank.address)
            assert.equal(result.toString(), tokens('100'), 'Decentral bank wallet balance before staking')

            //is staking balance
            result = await decentralBank.isStaked(customer)
            assert.equal(result.toString(), 'true', 'customer is staking status after staking')

            //issue Tokens
            await decentralBank.issueTokens({from: owner})

            //Ensure that only owner can issue Tokens
            await decentralBank.issueTokens({from: customer}).should.be.rejected;

            // Unstake tokens
            await decentralBank.unstakeTokens({from: customer})

            //check unstaking balances
            result = await tether.balanceOf(customer)
            assert.equal(result.toString(), tokens('100'), 'Customer mock wallet balance after unstaking')

            //updated balance of Decentral bank
            //result = await decentralBank.stakingBalance(customer)
            result = await tether.balanceOf(decentralBank.address)
            assert.equal(result.toString(), tokens('0'), 'Decentral bank wallet balance after staking from customer')

            //is unstaking balance
            result = await decentralBank.isStaked(customer)
            assert.equal(result.toString(), 'false', 'customer is no longer staking status after unstaking')

        })
    })

})

