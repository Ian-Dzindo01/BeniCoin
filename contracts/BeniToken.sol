pragma solidity ^0.4.2;

contract BeniToken {

  string public name = 'Beni Token';
  string public symbol = 'BENI';
  string public standard = 'Beni Token v1.0';
  uint256 public totalSupply;

  event Transfer(
    address indexed _from,
    address indexed _to,
    uint256 _value
  );

  event Approval(
    address indexed _owner,
    address indexed _spender,
    uint256 _value
    );

  mapping(address => uint256) public balanceOf;

  mapping(address => mapping(address => uint256)) public allowance;

  constructor(uint256 _initialSupply) public {
    totalSupply = _initialSupply;                        // local variable names should start with an underscore

    balanceOf[msg.sender] = _initialSupply;
  }

  function transfer(address _to, uint256 _value) public returns (bool success) {
    require(balanceOf[msg.sender] >= _value);

    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    emit Transfer(msg.sender, _to, _value);

    return true;
  }

  function approve(address _spender, uint256 _value) public returns (bool success) {
    allowance[msg.sender][_spender] = _value;             // msg.sender approves _spender to spend money on his behalf

    emit Approval(msg.sender, _spender, _value);

    return true;
  }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

    require(balanceOf[_from] >= _value);
    require(allowance[_from][msg.sender] >= _value);         // this function is going to be called on behalf of the guy who is spending tokens that belong to _from

    balanceOf[_from] -= _value;
    balanceOf[_to] += _value;

    allowance[_from][msg.sender] -= _value;         // take away what has been spent here

    emit Transfer(_from, _to, _value);

    return true;
  }
}

