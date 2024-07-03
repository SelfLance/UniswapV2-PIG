// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {IUniswapV2Pair} from "./interfaces/IUniswapV2Pair.sol";

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
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

interface IUniswapV2Factory {
    function createPair(
        address tokenA,
        address tokenB
    ) external returns (address pair);
}

interface IUniswapV2Router02 {
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;

    function factory() external pure returns (address);

    function WETH() external pure returns (address);

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    )
        external
        payable
        returns (uint amountToken, uint amountETH, uint liquidity);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);
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
    IUniswapV2Router02 public uniswapV2Router;
    address public uniswapV2Pair;

    constructor(address _uniswapV2RouterAddress) {
        _balances[msg.sender] = _tTotal;
        _isExcludedFromFee[owner()] = true;
        _isExcludedFromFee[address(this)] = true;
        _isExcludedFromFee[_marketingWallet] = true;
        emit Transfer(address(0), msg.sender, _tTotal);

        uniswapV2Router = IUniswapV2Router02(_uniswapV2RouterAddress);
        isRouterAddress[_uniswapV2RouterAddress] = true;
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
        // address uniswapV2Pair;
        if (!tradingOpen) {
            _approve(address(this), address(uniswapV2Router), _tTotal);
            uniswapV2Pair = IUniswapV2Factory(uniswapV2Router.factory())
                .createPair(address(this), uniswapV2Router.WETH());
        }
        uniswapV2Router.addLiquidityETH{value: address(this).balance}(
            address(this),
            balanceOf(address(this)),
            0,
            0,
            owner(),
            block.timestamp + 2 minutes
        );

        IERC20(uniswapV2Pair).approve(
            address(uniswapV2Router),
            type(uint256).max
        );
        tradingOpen = true;
        isRouterAddress[address(uniswapV2Router)] = true;
        isPairAddress[uniswapV2Pair] = true;
    }

    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function withdrawTokens() external onlyOwner {
        _transfer(address(this), owner(), balanceOf(address(this)));
    }

    function deposit() public payable {}

    function swapTokensForEth(uint256 tokenAmount) private {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = uniswapV2Router.WETH();
        _approve(address(this), address(uniswapV2Router), tokenAmount);
        try
            uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
                tokenAmount,
                0, // accept any amount of ETH
                path,
                _marketingWallet,
                block.timestamp
            )
        {
            emit SwapSuccess(tokenAmount);
        } catch {
            _balances[_marketingWallet] += tokenAmount;
            emit SwapFailed(tokenAmount);
        }
    }
}
