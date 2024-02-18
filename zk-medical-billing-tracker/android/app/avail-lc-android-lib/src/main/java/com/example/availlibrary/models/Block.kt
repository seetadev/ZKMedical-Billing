package com.example.availlibrary.models


import com.google.gson.annotations.SerializedName


data class Block(

    @SerializedName("latest") var latest: Int? = null,
    @SerializedName("available") var available: Available? = Available()

)