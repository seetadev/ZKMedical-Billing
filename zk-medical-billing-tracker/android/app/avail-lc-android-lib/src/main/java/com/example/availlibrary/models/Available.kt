package com.example.availlibrary.models

import com.google.gson.annotations.SerializedName


data class Available(

    @SerializedName("first") var first: Int? = null,
    @SerializedName("last") var last: Int? = null

)