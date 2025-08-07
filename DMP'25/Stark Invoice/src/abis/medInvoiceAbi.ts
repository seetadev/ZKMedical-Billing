export const MED_INVOICE_ABI = [
  {
    type: "impl",
    name: "ParkProInvoiceContractImpl",
    interface_name:
      "sn_parkpro_invoice::interfaces::IParkProInvoice::IParkProInvoiceContract",
  },
  {
    type: "struct",
    name: "core::byte_array::ByteArray",
    members: [
      {
        name: "data",
        type: "core::array::Array::<core::bytes_31::bytes31>",
      },
      {
        name: "pending_word",
        type: "core::felt252",
      },
      {
        name: "pending_word_len",
        type: "core::integer::u32",
      },
    ],
  },
  {
    type: "enum",
    name: "core::bool",
    variants: [
      {
        name: "False",
        type: "()",
      },
      {
        name: "True",
        type: "()",
      },
    ],
  },
  {
    type: "struct",
    name: "sn_parkpro_invoice::interfaces::IParkProInvoice::FileRecord",
    members: [
      {
        name: "file_name",
        type: "core::byte_array::ByteArray",
      },
      {
        name: "ipfs_cid",
        type: "core::byte_array::ByteArray",
      },
      {
        name: "timestamp",
        type: "core::integer::u64",
      },
      {
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "exists",
        type: "core::bool",
      },
    ],
  },
  {
    type: "struct",
    name: "core::integer::u256",
    members: [
      {
        name: "low",
        type: "core::integer::u128",
      },
      {
        name: "high",
        type: "core::integer::u128",
      },
    ],
  },
  {
    type: "struct",
    name: "sn_parkpro_invoice::interfaces::IParkProInvoice::SubscriptionPlan",
    members: [
      {
        name: "plan_id",
        type: "core::integer::u8",
      },
      {
        name: "cost",
        type: "core::integer::u256",
      },
      {
        name: "files_allowed",
        type: "core::integer::u64",
      },
      {
        name: "plan_name",
        type: "core::byte_array::ByteArray",
      },
    ],
  },
  {
    type: "interface",
    name: "sn_parkpro_invoice::interfaces::IParkProInvoice::IParkProInvoiceContract",
    items: [
      {
        type: "function",
        name: "save_file",
        inputs: [
          {
            name: "file_name",
            type: "core::byte_array::ByteArray",
          },
          {
            name: "ipfs_cid",
            type: "core::byte_array::ByteArray",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "get_files",
        inputs: [
          {
            name: "user_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::array::Array::<sn_parkpro_invoice::interfaces::IParkProInvoice::FileRecord>",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_user_tokens",
        inputs: [
          {
            name: "user_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "is_subscribed",
        inputs: [
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_subscription_details",
        inputs: [
          {
            name: "user_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "(core::bool, core::integer::u64)",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_subscription_end_date",
        inputs: [
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u64",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "subscribe",
        inputs: [],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "withdraw_tokens",
        inputs: [
          {
            name: "amount",
            type: "core::integer::u256",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "subscribe_to_plan",
        inputs: [
          {
            name: "plan_id",
            type: "core::integer::u8",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "get_subscription_plan",
        inputs: [
          {
            name: "plan_id",
            type: "core::integer::u8",
          },
        ],
        outputs: [
          {
            type: "sn_parkpro_invoice::interfaces::IParkProInvoice::SubscriptionPlan",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_user_file_limits",
        inputs: [
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "(core::integer::u64, core::integer::u64)",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_all_plans",
        inputs: [],
        outputs: [
          {
            type: "core::array::Array::<sn_parkpro_invoice::interfaces::IParkProInvoice::SubscriptionPlan>",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_user_plan_purchases",
        inputs: [
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "plan_id",
            type: "core::integer::u8",
          },
        ],
        outputs: [
          {
            type: "core::integer::u64",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_user_subscription_summary",
        inputs: [
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "(core::integer::u64, core::integer::u64, core::integer::u8)",
          },
        ],
        state_mutability: "view",
      },
    ],
  },
  {
    type: "impl",
    name: "OwnableImpl",
    interface_name: "openzeppelin_access::ownable::interface::IOwnable",
  },
  {
    type: "interface",
    name: "openzeppelin_access::ownable::interface::IOwnable",
    items: [
      {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "transfer_ownership",
        inputs: [
          {
            name: "new_owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "renounce_ownership",
        inputs: [],
        outputs: [],
        state_mutability: "external",
      },
    ],
  },
  {
    type: "constructor",
    name: "constructor",
    inputs: [
      {
        name: "ppt_token",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "initial_owner",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    type: "event",
    name: "sn_parkpro_invoice::contracts::ParkProInvoice::ParkProInvoiceContract::FileSaved",
    kind: "struct",
    members: [
      {
        name: "user",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "file_id",
        type: "core::integer::u64",
        kind: "data",
      },
      {
        name: "file_name",
        type: "core::byte_array::ByteArray",
        kind: "data",
      },
      {
        name: "ipfs_cid",
        type: "core::byte_array::ByteArray",
        kind: "data",
      },
      {
        name: "timestamp",
        type: "core::integer::u64",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "sn_parkpro_invoice::contracts::ParkProInvoice::ParkProInvoiceContract::NewSubscription",
    kind: "struct",
    members: [
      {
        name: "subscriber",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "end_time",
        type: "core::integer::u64",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "sn_parkpro_invoice::contracts::ParkProInvoice::ParkProInvoiceContract::PlanSubscription",
    kind: "struct",
    members: [
      {
        name: "subscriber",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "plan_id",
        type: "core::integer::u8",
        kind: "data",
      },
      {
        name: "files_allowed",
        type: "core::integer::u64",
        kind: "data",
      },
      {
        name: "cost",
        type: "core::integer::u256",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
    kind: "struct",
    members: [
      {
        name: "previous_owner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "new_owner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
    kind: "struct",
    members: [
      {
        name: "previous_owner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "new_owner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
    kind: "enum",
    variants: [
      {
        name: "OwnershipTransferred",
        type: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
        kind: "nested",
      },
      {
        name: "OwnershipTransferStarted",
        type: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
        kind: "nested",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin_security::reentrancyguard::ReentrancyGuardComponent::Event",
    kind: "enum",
    variants: [],
  },
  {
    type: "event",
    name: "sn_parkpro_invoice::contracts::ParkProInvoice::ParkProInvoiceContract::Event",
    kind: "enum",
    variants: [
      {
        name: "FileSaved",
        type: "sn_parkpro_invoice::contracts::ParkProInvoice::ParkProInvoiceContract::FileSaved",
        kind: "nested",
      },
      {
        name: "NewSubscription",
        type: "sn_parkpro_invoice::contracts::ParkProInvoice::ParkProInvoiceContract::NewSubscription",
        kind: "nested",
      },
      {
        name: "PlanSubscription",
        type: "sn_parkpro_invoice::contracts::ParkProInvoice::ParkProInvoiceContract::PlanSubscription",
        kind: "nested",
      },
      {
        name: "OwnableEvent",
        type: "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
        kind: "flat",
      },
      {
        name: "ReentrancyGuardEvent",
        type: "openzeppelin_security::reentrancyguard::ReentrancyGuardComponent::Event",
        kind: "flat",
      },
    ],
  },
] as const;
