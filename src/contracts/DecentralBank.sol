pragma solidity ^0.5.0;

import './RWD.sol';
import './Tether.sol';

contract DecentralBank{
    string public name = 'Decentral Bank';
    address public owner;
    Tether public tether;
    RWD public rwd;

    address[] public stakers;

    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaked;

    constructor(RWD _rwd, Tether _tether) public{
        rwd = _rwd;
        tether = _tether;
        owner = msg.sender;
    }

    //staking function
    function depositTokens(uint _amount) public{
        require(_amount > 0, 'amount cannot be 0');

        //Transfer tether token to this contract address for staking
        tether.transferFrom(msg.sender, address(this), _amount);

        stakingBalance[msg.sender] += _amount;

        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }

        isStaked[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    //unstake tokens
    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];
        //require the amount to be greater than 0
        require(balance > 0, 'staking balance cant be less than zero');

        //transfer the tokens to the specified contract address from our bank
        tether.transfer(msg.sender, balance);

        //reset staking balance
        stakingBalance[msg.sender] = 0;

        //Update staking status
        isStaked[msg.sender] = false;

    }

    function issueTokens() public {
        //require the owner to issue tokens
        require(msg.sender == owner, 'caller must be owner');

        for(uint i=0;i<stakers.length;i++)
        {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient] /9; // /9 to create percentage incentive for staking
            if(balance > 0)
            {
                rwd.transfer(recipient, balance);
            }
        }
    }
}