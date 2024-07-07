// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {INonfungiblePositionManager} from "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
// import {IERC20} from "@uniswap/v3-core/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IPeripheryImmutableState} from "@uniswap/v3-periphery/contracts/interfaces/IPeripheryImmutableState.sol";

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;
        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        return c;
    }
}

contract Ownable is Context {
    address private _owner;
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor() {
        _transferOwnership(_msgSender());
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract DancingPig is Context, IERC20, Ownable {
    using SafeMath for uint256;

    uint256 private _buyTax = 20;
    uint256 private _sellTax = 20;
    uint8 private constant _decimals = 18;
    uint256 private _tTotal = 377777777777777 * 10 ** _decimals;
    uint256 public _maxTxAmount = _tTotal.mul(3).div(100);
    uint256 public _maxWalletSize = _tTotal.mul(3).div(100);
    string private constant _name = "Dancing Pig";
    string private constant _symbol = "PIG";

    mapping(address => bool) private isRouterAddress;
    mapping(address => bool) private isPairAddress;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => bool) private _isExcludedFromFee;

    address payable private _marketingWallet =
        payable(0x4AACAF8d63B20572bdd6FCE04FD485A44967b508);
    bool private tradingOpen;
    uint256 private buyCount = 0;
    uint256 private sellCount = 0;

    ISwapRouter public uniswapV3Router;
    INonfungiblePositionManager public positionManager;
    address public uniswapV3Factory;
    uint24 public constant poolFee = 3000; // 0.3% fee tier

    constructor(
        address _uniswapV3RouterAddress,
        address _positionManagerAddress
    ) {
        _balances[msg.sender] = _tTotal;
        _isExcludedFromFee[owner()] = true;
        _isExcludedFromFee[address(this)] = true;
        _isExcludedFromFee[_marketingWallet] = true;
        emit Transfer(address(0), msg.sender, _tTotal);

        uniswapV3Router = ISwapRouter(_uniswapV3RouterAddress);
        positionManager = INonfungiblePositionManager(_positionManagerAddress);
        uniswapV3Factory = IPeripheryImmutableState(_uniswapV3RouterAddress)
            .factory();
        isRouterAddress[_uniswapV3RouterAddress] = true;
    }

    receive() external payable {}

    event SwapSuccess(uint256 tokenAmount);
    event SwapFailed(uint256 tokenAmount);

    function name() public pure returns (string memory) {
        return _name;
    }

    function symbol() public pure returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view override returns (uint256) {
        return _tTotal;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function transfer(
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(
        address owner,
        address spender
    ) public view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(
        address spender,
        uint256 amount
    ) public override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(
            sender,
            _msgSender(),
            _allowances[sender][_msgSender()].sub(
                amount,
                "ERC20: transfer amount exceeds allowance"
            )
        );
        return true;
    }

    function _approve(address owner, address spender, uint256 amount) private {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _transfer(address from, address to, uint256 amount) private {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "Transfer amount must be greater than zero");
        require(
            amount <= _maxTxAmount || from == owner(),
            "Transfer amount exceeds the maxTxAmount."
        );
        // Check if the recipient's balance will exceed the max wallet size after the transfer
        if (
            to != owner() &&
            to != address(0) &&
            to != address(0xdead) &&
            !isPairAddress[to]
        ) {
            require(
                _balances[to].add(amount) <= _maxWalletSize || to == owner(),
                "Recipient's balance exceeds the max wallet size"
            );
        }

        if (
            from != owner() &&
            to != owner() &&
            to != address(0) &&
            to != address(0xdead)
        ) {
            if (isPairAddress[from] || isPairAddress[to]) {
                require(tradingOpen, "Trading is not enabled yet.");
                if (!_isExcludedFromFee[from] && !_isExcludedFromFee[to]) {
                    uint256 taxAmount = 0;
                    if (isPairAddress[to]) {
                        sellCount++;
                        taxAmount = amount.mul(_sellTax).div(100);
                        if (sellCount >= 30) {
                            _sellTax = 1;
                        }
                    } else if (isPairAddress[from]) {
                        buyCount++;
                        taxAmount = amount.mul(_buyTax).div(100);
                        if (buyCount >= 30) {
                            _buyTax = 1;
                        }
                    }
                    uint256 transferAmount = amount.sub(taxAmount);
                    _balances[from] = _balances[from].sub(amount);
                    _balances[to] = _balances[to].add(transferAmount);
                    if (taxAmount > 0) swapTokensForEth(taxAmount);
                    emit Transfer(from, _marketingWallet, taxAmount);
                } else {
                    _balances[from] = _balances[from].sub(amount);
                    _balances[to] = _balances[to].add(amount);
                    emit Transfer(from, to, amount);
                }
            } else {
                _balances[from] = _balances[from].sub(amount);
                _balances[to] = _balances[to].add(amount);
                emit Transfer(from, to, amount);
            }
        } else {
            _balances[from] = _balances[from].sub(amount);
            _balances[to] = _balances[to].add(amount);
            emit Transfer(from, to, amount);
        }
    }

    function openTrading() external onlyOwner {
        if (!tradingOpen) {
            _approve(address(this), address(uniswapV3Router), _tTotal);

            // Approve the position manager to transfer the tokens on behalf of the contract
            _approve(address(this), address(positionManager), _tTotal);

            // Create and initialize the pool
            positionManager.createAndInitializePoolIfNecessary(
                address(this),
                uniswapV3Router.WETH(),
                poolFee,
                0 // Initial price (in terms of WETH per token)
            );

            // Mint the initial liquidity position
            positionManager.mint(
                INonfungiblePositionManager.MintParams({
                    token0: address(this),
                    token1: uniswapV3Router.WETH(),
                    fee: poolFee,
                    tickLower: -887220, // Arbitrary large negative number for the initial position
                    tickUpper: 887220, // Arbitrary large positive number for the initial position
                    amount0Desired: _tTotal,
                    amount1Desired: address(this).balance,
                    amount0Min: 0,
                    amount1Min: 0,
                    recipient: owner(),
                    deadline: block.timestamp + 2 minutes
                })
            );

            tradingOpen = true;
        }
    }

    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function withdrawTokens() external onlyOwner {
        _transfer(address(this), owner(), balanceOf(address(this)));
    }

    function deposit() public payable {}

    function swapTokensForEth(uint256 tokenAmount) private {
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: address(this),
                tokenOut: uniswapV3Router.WETH(),
                fee: poolFee,
                recipient: _marketingWallet,
                deadline: block.timestamp,
                amountIn: tokenAmount,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        try uniswapV3Router.exactInputSingle(params) {
            emit SwapSuccess(tokenAmount);
        } catch {
            _balances[_marketingWallet] += tokenAmount;
            emit SwapFailed(tokenAmount);
        }
    }
}
