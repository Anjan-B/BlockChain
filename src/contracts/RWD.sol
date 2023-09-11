pragma solidity ^0.5.0;

contract RWD{
    string public name = 'Reward token';
    string public symbol = 'RWD';
    uint256 public totalSupply = 100000000000000000000000;
    uint8 decimals = 18;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() public {
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to,uint _value) public returns (bool sucess){
        require(balanceOf[msg.sender]>=_value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value)public returns (bool sucess){
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from,address _to, uint _value)public returns (bool sucess){
        require(balanceOf[_from]>=_value);
        require(allowance[_from][msg.sender]>=_value);
        balanceOf[_to] += _value;
        balanceOf[_from] -= _value;
        allowance[msg.sender][_from] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

}