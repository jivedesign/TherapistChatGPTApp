import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Chat, MessageType, User } from "@flyerhq/react-native-chat-ui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ChatClient } from "../model/chat.client";
import { ChatDto, ChatMessageDto } from "../model/chat.dto";

const uuidv4 = () => {
 return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
  const r = Math.floor(Math.random() * 16);
  const v = c === "x" ? r : (r % 4) + 8;
  return v.toString(16);
 });
};

const me: User = { firstName: "me", id: uuidv4() };
const therapist: User = { firstName: "therapist", id: uuidv4() };

const getAuthorByName = (name: string): User => {
 if (name.toLowerCase() === therapist.firstName) return therapist;
 return me;
};

const mapChatToUiChatMessages = (chatDto: ChatDto): MessageType.Any[] => {
 const chatMessages = [...chatDto.messages];
 return chatMessages.reverse().map((chatMessage) => {
  const uiMessage: MessageType.Text = {
   author: getAuthorByName(chatMessage.authorName),
   createdAt: chatMessage.createdAt,
   id: chatMessage.id,
   text: chatMessage.content,
   type: "text",
  };
  return uiMessage;
 });
};

const chatOnInitialize: ChatDto = {
 messages: [
  {
   authorName: "therapist",
   id: uuidv4(),
   content: "Hello! How are you?",
   createdAt: Date.now(),
  },
 ],
};

export const ChatView = () => {
 const [chat, setChat] = useState<ChatDto>(chatOnInitialize);

 const updateChatWithApiReply = useCallback(async (localChat: ChatDto) => {
  const chatApiBaseUrl = process.env.CHAT_GPT_NGROK_BASE_URL;
  const chatClient = new ChatClient(chatApiBaseUrl);
  


  try {
    await new Promise(resolve => setTimeout(resolve, 5000));

    const newChat = await chatClient.respondTo(localChat);
    setChat(newChat);
  } catch (err) {
    throw new Error('Error responding:' , err)
  }
 }, [chat]);

 const chatAfterPressSend = useCallback((message: ChatMessageDto): ChatDto => {
  const newChat = { messages: [...chat.messages, message] };
  setChat(newChat);
  return newChat;
 }, [setChat]);

 const handleSendPress = useCallback(async (message: MessageType.PartialText) => {
  const newMessage: ChatMessageDto = {
   authorName: "me",
   createdAt: Date.now(),
   id: uuidv4(),
   content: message.text,
  };
  const newChat = chatAfterPressSend(newMessage);
  await updateChatWithApiReply(newChat);
 }, []);

 const renderChatMessages = useCallback(() => {
  return (
    <Chat
    messages={mapChatToUiChatMessages(chat)}
    onSendPress={handleSendPress}
    user={me}
   />
  )
 }, [chat, handleSendPress]);

 return (
  <SafeAreaProvider>
   <View style={styles.chatHeader}>
    <Text style={styles.chatHeaderText}>🥸 Thadeus the Therapist</Text>
   </View>
   {renderChatMessages()}
  </SafeAreaProvider>
 );
};

const styles = StyleSheet.create({
 chatHeader: {
  backgroundColor: "#FAFAFA",
 },
 chatHeaderText: {
  paddingTop: 50,
  paddingLeft: 20,
  paddingBottom: 10,
  fontSize: 27,
  fontWeight: "bold",
 },
});