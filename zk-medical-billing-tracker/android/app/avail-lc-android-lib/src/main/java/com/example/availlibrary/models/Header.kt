package com.example.availlibrary.models

import com.google.gson.annotations.SerializedName


data class Header(

    @SerializedName("hash") var hash: String? = null,
    @SerializedName("parent_hash") var parentHash: String? = null,
    @SerializedName("number") var number: Int? = null,
    @SerializedName("state_root") var stateRoot: String? = null,
    @SerializedName("extrinsics_root") var extrinsicsRoot: String? = null,
    @SerializedName("extension") var extension: Extension? = Extension()

)