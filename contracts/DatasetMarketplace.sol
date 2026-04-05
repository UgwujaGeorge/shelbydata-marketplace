// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DatasetMarketplace
 * @notice Decentralized marketplace for AI training datasets stored on Shelby Protocol
 * @dev Buyers pay ETH to creator; blob names on Shelby are stored and revealed post-purchase
 */
contract DatasetMarketplace {
    struct Dataset {
        uint256 id;
        address creator;
        string name;
        string description;
        string category;
        string shelbyBlobName;   // Shelby network blob identifier
        string shelbyAccount;    // Uploader's Shelby/Aptos account address
        uint256 price;           // Price in wei
        uint256 fileSize;        // File size in bytes
        uint256 downloadCount;
        uint256 createdAt;
        bool active;
    }

    uint256 public datasetCount;
    uint256 public platformFeeBps = 250; // 2.5%
    address public owner;

    mapping(uint256 => Dataset) private datasets;
    mapping(uint256 => mapping(address => bool)) private purchases;
    mapping(address => uint256[]) private creatorDatasets;

    event DatasetListed(
        uint256 indexed id,
        address indexed creator,
        string name,
        string category,
        uint256 price,
        uint256 fileSize
    );
    event DatasetPurchased(
        uint256 indexed id,
        address indexed buyer,
        address indexed creator,
        uint256 price
    );
    event DatasetDeactivated(uint256 indexed id);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier datasetExists(uint256 id) {
        require(id < datasetCount, "Dataset does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice List a dataset for sale
     * @param name Human-readable dataset name
     * @param description Dataset description
     * @param category Dataset category (e.g. "NLP", "Computer Vision")
     * @param shelbyBlobName The blob name on Shelby network
     * @param shelbyAccount The Shelby/Aptos account address holding the blob
     * @param price Price in wei (0 = free)
     * @param fileSize File size in bytes
     */
    function listDataset(
        string calldata name,
        string calldata description,
        string calldata category,
        string calldata shelbyBlobName,
        string calldata shelbyAccount,
        uint256 price,
        uint256 fileSize
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(shelbyBlobName).length > 0, "Blob name required");
        require(bytes(shelbyAccount).length > 0, "Shelby account required");

        uint256 id = datasetCount++;
        datasets[id] = Dataset({
            id: id,
            creator: msg.sender,
            name: name,
            description: description,
            category: category,
            shelbyBlobName: shelbyBlobName,
            shelbyAccount: shelbyAccount,
            price: price,
            fileSize: fileSize,
            downloadCount: 0,
            createdAt: block.timestamp,
            active: true
        });
        creatorDatasets[msg.sender].push(id);

        emit DatasetListed(id, msg.sender, name, category, price, fileSize);
        return id;
    }

    /**
     * @notice Purchase a dataset — ETH is sent directly to the creator (minus platform fee)
     * @param datasetId The dataset to purchase
     */
    function purchase(uint256 datasetId) external payable datasetExists(datasetId) {
        Dataset storage dataset = datasets[datasetId];
        require(dataset.active, "Dataset not active");
        require(msg.value >= dataset.price, "Insufficient payment");
        require(!purchases[datasetId][msg.sender], "Already purchased");
        require(msg.sender != dataset.creator, "Creator cannot purchase own dataset");

        purchases[datasetId][msg.sender] = true;
        dataset.downloadCount++;

        // Split payment: platform fee + creator payout
        uint256 fee = (msg.value * platformFeeBps) / 10000;
        uint256 creatorPayout = msg.value - fee;

        (bool success, ) = payable(dataset.creator).call{value: creatorPayout}("");
        require(success, "Payment to creator failed");

        emit DatasetPurchased(datasetId, msg.sender, dataset.creator, msg.value);
    }

    /**
     * @notice Check if an address has access to a dataset (purchased or is creator)
     */
    function hasAccess(uint256 datasetId, address user)
        external
        view
        datasetExists(datasetId)
        returns (bool)
    {
        return purchases[datasetId][user] || datasets[datasetId].creator == user;
    }

    /**
     * @notice Get full dataset info (blob name only visible if user has access)
     */
    function getDataset(uint256 datasetId)
        external
        view
        datasetExists(datasetId)
        returns (
            uint256 id,
            address creator,
            string memory name,
            string memory description,
            string memory category,
            string memory shelbyBlobName,
            string memory shelbyAccount,
            uint256 price,
            uint256 fileSize,
            uint256 downloadCount,
            uint256 createdAt,
            bool active
        )
    {
        Dataset storage d = datasets[datasetId];
        // Blob name is visible to creator and buyers; others see empty string
        bool canAccess = purchases[datasetId][msg.sender] || d.creator == msg.sender;
        return (
            d.id,
            d.creator,
            d.name,
            d.description,
            d.category,
            canAccess ? d.shelbyBlobName : "",
            canAccess ? d.shelbyAccount : "",
            d.price,
            d.fileSize,
            d.downloadCount,
            d.createdAt,
            d.active
        );
    }

    /**
     * @notice Get public dataset info (no blob name)
     */
    function getDatasetPublic(uint256 datasetId)
        external
        view
        datasetExists(datasetId)
        returns (
            uint256 id,
            address creator,
            string memory name,
            string memory description,
            string memory category,
            uint256 price,
            uint256 fileSize,
            uint256 downloadCount,
            uint256 createdAt,
            bool active
        )
    {
        Dataset storage d = datasets[datasetId];
        return (
            d.id,
            d.creator,
            d.name,
            d.description,
            d.category,
            d.price,
            d.fileSize,
            d.downloadCount,
            d.createdAt,
            d.active
        );
    }

    /**
     * @notice Get all dataset IDs created by a specific address
     */
    function getCreatorDatasets(address creator) external view returns (uint256[] memory) {
        return creatorDatasets[creator];
    }

    /**
     * @notice Creator can deactivate their own dataset
     */
    function deactivateDataset(uint256 datasetId) external datasetExists(datasetId) {
        require(datasets[datasetId].creator == msg.sender, "Not creator");
        datasets[datasetId].active = false;
        emit DatasetDeactivated(datasetId);
    }

    /**
     * @notice Withdraw accumulated platform fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice Update platform fee (max 10%)
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high");
        platformFeeBps = newFeeBps;
    }

    receive() external payable {}
}
