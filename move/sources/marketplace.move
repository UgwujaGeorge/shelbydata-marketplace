module marketplace::dataset_marketplace {
    use std::string::String;
    use std::signer;
    use std::vector;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::account;

    // ─── Errors ──────────────────────────────────────────────────────────────
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_DATASET_NOT_FOUND: u64 = 3;
    const E_INSUFFICIENT_PAYMENT: u64 = 4;
    const E_ALREADY_PURCHASED: u64 = 5;
    const E_CANNOT_BUY_OWN: u64 = 6;
    const E_NOT_ACTIVE: u64 = 7;
    const E_NOT_CREATOR: u64 = 8;
    const E_NOT_OWNER: u64 = 9;
    const E_EMPTY_NAME: u64 = 10;

    // ─── Constants ────────────────────────────────────────────────────────────
    const PLATFORM_FEE_BPS: u64 = 250; // 2.5%
    const BPS_DENOMINATOR: u64 = 10000;

    // ─── Structs ──────────────────────────────────────────────────────────────
    struct Dataset has store, drop, copy {
        id: u64,
        creator: address,
        name: String,
        description: String,
        category: String,
        shelby_blob_name: String,
        shelby_account: String,
        price: u64,        // in octa (1 APT = 1e8 octa)
        file_size: u64,
        download_count: u64,
        created_at: u64,
        active: bool,
    }

    struct MarketplaceState has key {
        datasets: vector<Dataset>,
        dataset_count: u64,
        owner: address,
        platform_fee_bps: u64,
    }

    struct PurchaseRecord has key {
        // dataset_id -> list of buyer addresses
        purchases: vector<PurchaseEntry>,
    }

    struct PurchaseEntry has store, drop, copy {
        dataset_id: u64,
        buyer: address,
    }

    // ─── Events ───────────────────────────────────────────────────────────────
    #[event]
    struct DatasetListed has drop, store {
        id: u64,
        creator: address,
        name: String,
        category: String,
        price: u64,
        file_size: u64,
    }

    #[event]
    struct DatasetPurchased has drop, store {
        dataset_id: u64,
        buyer: address,
        creator: address,
        price: u64,
    }

    // ─── Init ─────────────────────────────────────────────────────────────────
    public entry fun initialize(owner: &signer) {
        let owner_addr = signer::address_of(owner);
        assert!(!exists<MarketplaceState>(owner_addr), E_ALREADY_INITIALIZED);

        move_to(owner, MarketplaceState {
            datasets: vector::empty<Dataset>(),
            dataset_count: 0,
            owner: owner_addr,
            platform_fee_bps: PLATFORM_FEE_BPS,
        });

        move_to(owner, PurchaseRecord {
            purchases: vector::empty<PurchaseEntry>(),
        });
    }

    // ─── List Dataset ─────────────────────────────────────────────────────────
    public entry fun list_dataset(
        creator: &signer,
        name: String,
        description: String,
        category: String,
        shelby_blob_name: String,
        shelby_account: String,
        price: u64,
        file_size: u64,
        marketplace_addr: address,
    ) acquires MarketplaceState {
        assert!(std::string::length(&name) > 0, E_EMPTY_NAME);
        assert!(exists<MarketplaceState>(marketplace_addr), E_NOT_INITIALIZED);

        let state = borrow_global_mut<MarketplaceState>(marketplace_addr);
        let id = state.dataset_count;

        let dataset = Dataset {
            id,
            creator: signer::address_of(creator),
            name,
            description,
            category,
            shelby_blob_name,
            shelby_account,
            price,
            file_size,
            download_count: 0,
            created_at: timestamp::now_seconds(),
            active: true,
        };

        event::emit(DatasetListed {
            id,
            creator: signer::address_of(creator),
            name: dataset.name,
            category: dataset.category,
            price,
            file_size,
        });

        vector::push_back(&mut state.datasets, dataset);
        state.dataset_count = state.dataset_count + 1;
    }

    // ─── Purchase Dataset ─────────────────────────────────────────────────────
    public entry fun purchase(
        buyer: &signer,
        dataset_id: u64,
        marketplace_addr: address,
    ) acquires MarketplaceState, PurchaseRecord {
        assert!(exists<MarketplaceState>(marketplace_addr), E_NOT_INITIALIZED);

        let state = borrow_global_mut<MarketplaceState>(marketplace_addr);
        assert!(dataset_id < state.dataset_count, E_DATASET_NOT_FOUND);

        let dataset = vector::borrow_mut(&mut state.datasets, dataset_id);
        assert!(dataset.active, E_NOT_ACTIVE);

        let buyer_addr = signer::address_of(buyer);
        assert!(buyer_addr != dataset.creator, E_CANNOT_BUY_OWN);

        // Check not already purchased
        let purchase_record = borrow_global_mut<PurchaseRecord>(marketplace_addr);
        let i = 0;
        let len = vector::length(&purchase_record.purchases);
        while (i < len) {
            let entry = vector::borrow(&purchase_record.purchases, i);
            assert!(!(entry.dataset_id == dataset_id && entry.buyer == buyer_addr), E_ALREADY_PURCHASED);
            i = i + 1;
        };

        // Handle payment
        let price = dataset.price;
        assert!(coin::balance<AptosCoin>(buyer_addr) >= price, E_INSUFFICIENT_PAYMENT);

        let fee = (price * state.platform_fee_bps) / BPS_DENOMINATOR;
        let creator_payout = price - fee;
        let creator_addr = dataset.creator;

        // Pay creator
        coin::transfer<AptosCoin>(buyer, creator_addr, creator_payout);
        // Platform fee stays in marketplace (can be withdrawn by owner)
        coin::transfer<AptosCoin>(buyer, marketplace_addr, fee);

        // Record purchase
        vector::push_back(&mut purchase_record.purchases, PurchaseEntry {
            dataset_id,
            buyer: buyer_addr,
        });

        dataset.download_count = dataset.download_count + 1;

        event::emit(DatasetPurchased {
            dataset_id,
            buyer: buyer_addr,
            creator: creator_addr,
            price,
        });
    }

    // ─── Deactivate ───────────────────────────────────────────────────────────
    public entry fun deactivate_dataset(
        creator: &signer,
        dataset_id: u64,
        marketplace_addr: address,
    ) acquires MarketplaceState {
        let state = borrow_global_mut<MarketplaceState>(marketplace_addr);
        assert!(dataset_id < state.dataset_count, E_DATASET_NOT_FOUND);
        let dataset = vector::borrow_mut(&mut state.datasets, dataset_id);
        assert!(dataset.creator == signer::address_of(creator), E_NOT_CREATOR);
        dataset.active = false;
    }

    // ─── Views ────────────────────────────────────────────────────────────────
    #[view]
    public fun get_dataset_count(marketplace_addr: address): u64 acquires MarketplaceState {
        if (!exists<MarketplaceState>(marketplace_addr)) return 0;
        borrow_global<MarketplaceState>(marketplace_addr).dataset_count
    }

    #[view]
    public fun get_dataset_public(marketplace_addr: address, dataset_id: u64): (
        u64, address, String, String, String, u64, u64, u64, u64, bool
    ) acquires MarketplaceState {
        let state = borrow_global<MarketplaceState>(marketplace_addr);
        let d = vector::borrow(&state.datasets, dataset_id);
        (d.id, d.creator, d.name, d.description, d.category, d.price, d.file_size, d.download_count, d.created_at, d.active)
    }

    #[view]
    public fun get_dataset_blob(
        marketplace_addr: address,
        dataset_id: u64,
        caller: address,
    ): (String, String) acquires MarketplaceState, PurchaseRecord {
        let state = borrow_global<MarketplaceState>(marketplace_addr);
        let d = vector::borrow(&state.datasets, dataset_id);

        // Only creator or purchaser can see blob name
        let has_access = d.creator == caller;
        if (!has_access) {
            let purchase_record = borrow_global<PurchaseRecord>(marketplace_addr);
            let i = 0;
            let len = vector::length(&purchase_record.purchases);
            while (i < len) {
                let entry = vector::borrow(&purchase_record.purchases, i);
                if (entry.dataset_id == dataset_id && entry.buyer == caller) {
                    has_access = true;
                };
                i = i + 1;
            };
        };

        if (has_access) {
            (d.shelby_blob_name, d.shelby_account)
        } else {
            (std::string::utf8(b""), std::string::utf8(b""))
        }
    }

    #[view]
    public fun has_access(
        marketplace_addr: address,
        dataset_id: u64,
        user: address,
    ): bool acquires MarketplaceState, PurchaseRecord {
        let state = borrow_global<MarketplaceState>(marketplace_addr);
        let d = vector::borrow(&state.datasets, dataset_id);
        if (d.creator == user) return true;

        let purchase_record = borrow_global<PurchaseRecord>(marketplace_addr);
        let i = 0;
        let len = vector::length(&purchase_record.purchases);
        while (i < len) {
            let entry = vector::borrow(&purchase_record.purchases, i);
            if (entry.dataset_id == dataset_id && entry.buyer == user) return true;
            i = i + 1;
        };
        false
    }
}
