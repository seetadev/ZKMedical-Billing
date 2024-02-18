package com.example.availlibrary.models

import com.google.gson.annotations.SerializedName


data class PublishMessage(

    @SerializedName("topic") var topic: String? = null,
    @SerializedName("message") var message: Message? = Message()

)