package com.example.availlibrary.models



import com.google.gson.annotations.SerializedName


data class PublishMessageListStrings(

    @SerializedName("message_list") var messageList: List<String>? = null

)

data class PublishMessageList(

    @SerializedName("message_list") var messageList: List<PublishMessage>? = null

)