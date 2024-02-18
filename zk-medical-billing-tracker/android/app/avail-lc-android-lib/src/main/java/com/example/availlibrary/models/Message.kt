package com.example.availlibrary.models

import com.google.gson.annotations.SerializedName


data class Message(

    @SerializedName("block_number") var blockNumber: Int? = null,
    @SerializedName("header") var header: Header? = Header()

)