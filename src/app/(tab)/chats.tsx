import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ImageSourcePropType,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HeaderStatusBar } from '@/components/HeaderStatusBar';
import { CustomTabBar } from '@/components/CustomTabBar';
import { ASSET_IMAGES, CALL_LOGS, ChatMessage, CallLog } from '@/constants/datingData';
import { formatApiImageUrl } from '@/services/api';
import {
  getConversations,
  getConversation,
  likeConversation,
  sendMessage,
} from '@/services/messageApi';

interface ChatScreenProps {
  showTabBar?: boolean;
  showHeaderBar?: boolean;
}

interface SelectedConversation {
  partnerId: string;
  name: string;
  avatar: ImageSourcePropType;
  isOnline: boolean;
  isMatched: boolean;
  messagesRemaining: number | null;
  messages: { id: string; sender: 'user' | 'contact'; text: string; time: string }[];
}

interface ChatListItem extends ChatMessage {
  partnerId: string;
  isMatched: boolean;
  messagesRemaining: number | null;
}

export default function ChatScreen({
  showTabBar = true,
  showHeaderBar = true,
}: ChatScreenProps = {}) {
  const {
    partnerId: routePartnerId,
    partnerName: routePartnerName,
    partnerPhoto: routePartnerPhoto,
  } = useLocalSearchParams<{
    partnerId?: string | string[];
    partnerName?: string | string[];
    partnerPhoto?: string | string[];
  }>();
  const requestedPartnerId = Array.isArray(routePartnerId)
    ? routePartnerId[0]
    : routePartnerId;
  const requestedPartnerName = Array.isArray(routePartnerName)
    ? routePartnerName[0]
    : routePartnerName;
  const requestedPartnerPhoto = Array.isArray(routePartnerPhoto)
    ? routePartnerPhoto[0]
    : routePartnerPhoto;
  const [activeTab, setActiveTab] = useState<'messages' | 'calls'>('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [calls] = useState<CallLog[]>(CALL_LOGS);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<SelectedConversation | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLikingPartner, setIsLikingPartner] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesScrollRef = useRef<ScrollView>(null);
  const lastOpenedPartnerId = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!selectedConversation && !selectedCall) return;

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (selectedConversation) {
            setSelectedConversation(null);
            setMessageError(null);
            return true;
          }
          if (selectedCall) {
            setSelectedCall(null);
            return true;
          }
          return false;
        },
      );

      return () => subscription.remove();
    }, [selectedConversation, selectedCall]),
  );

  const loadChats = useCallback(async () => {
    const conversations = await getConversations();
    setChats(
      conversations.map((conversation) => ({
        id: conversation.conversationId,
        partnerId: conversation.partner.id,
        name: conversation.partner.name,
        avatar: conversation.partner.primaryPhoto
          ? { uri: formatApiImageUrl(conversation.partner.primaryPhoto) }
          : ASSET_IMAGES.userProfile,
        lastMessage: conversation.lastMessage?.content || 'Say hello',
        timestamp: conversation.lastMessage?.createdAt
          ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        unreadCount:
          conversation.unreadCount > 0 ? conversation.unreadCount : undefined,
        isOnline: conversation.partner.isOnline,
        isMatched: conversation.isMatched,
        messagesRemaining: conversation.messagesRemaining,
      })),
    );
    setChatsError(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const refreshChats = async () => {
        try {
          await loadChats();
        } catch (error) {
          if (isActive) {
            setChatsError(
              error instanceof Error ? error.message : 'Unable to load chats.',
            );
            console.warn('Failed to load chats:', error);
          }
        } finally {
          if (isActive) setIsLoadingChats(false);
        }
      };

      void refreshChats();
      const interval = setInterval(() => void refreshChats(), 5000);
      return () => {
        isActive = false;
        clearInterval(interval);
      };
    }, [loadChats]),
  );

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCalls = calls.filter(
    (call) =>
      call.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const activePartnerId = selectedConversation?.partnerId;
  useEffect(() => {
    if (!activePartnerId) return;

    let isActive = true;
    const refreshMessages = async () => {
      try {
        const history = await getConversation(activePartnerId);
        if (!isActive) return;
        setSelectedConversation((current) =>
          current?.partnerId === activePartnerId
            ? {
                ...current,
                messages: history.items
                  .slice()
                  .sort(
                    (left, right) =>
                      new Date(left.createdAt).getTime() -
                      new Date(right.createdAt).getTime(),
                  )
                  .map((message) => ({
                    id: message.id,
                    sender: message.isOwn ? 'user' : 'contact',
                    text: message.content || '',
                    time: new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  })),
                isMatched: history.isMatched,
                messagesRemaining: history.messagesRemaining,
              }
            : current,
        );
        setMessageError(null);
      } catch (error) {
        if (isActive) {
          setMessageError(
            error instanceof Error
              ? error.message
              : 'Unable to load this conversation.',
          );
          console.warn('Failed to refresh conversation:', error);
        }
      } finally {
        if (isActive) setIsLoadingMessages(false);
      }
    };

    void refreshMessages();
    const interval = setInterval(() => void refreshMessages(), 3000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [activePartnerId]);

  // Handle open individual chat detail screen
  const openChatDetail = useCallback((chat: ChatListItem) => {
    setSelectedConversation({
      partnerId: chat.partnerId,
      name: chat.name,
      avatar: chat.avatar,
      isOnline: Boolean(chat.isOnline),
      isMatched: chat.isMatched,
      messagesRemaining: chat.messagesRemaining,
      messages: [],
    });
    setIsLoadingMessages(true);
    setMessageError(null);
  }, []);

  useEffect(() => {
    if (!requestedPartnerId) {
      lastOpenedPartnerId.current = null;
      return;
    }
    if (isLoadingChats || lastOpenedPartnerId.current === requestedPartnerId) {
      return;
    }

    const chat = chats.find((item) => item.partnerId === requestedPartnerId);
    const directChat: ChatListItem = chat ?? {
      id: requestedPartnerId,
      partnerId: requestedPartnerId,
      name: requestedPartnerName || 'New connection',
      avatar: requestedPartnerPhoto
        ? { uri: formatApiImageUrl(requestedPartnerPhoto) }
        : ASSET_IMAGES.userProfile,
      lastMessage: 'Say hello',
      timestamp: '',
      isOnline: false,
      isMatched: false,
      messagesRemaining: 2,
    };

    const frameId = requestAnimationFrame(() => {
      lastOpenedPartnerId.current = requestedPartnerId;
      openChatDetail(directChat);
      router.setParams({
        partnerId: undefined,
        partnerName: undefined,
        partnerPhoto: undefined,
      });
    });
    return () => cancelAnimationFrame(frameId);
  }, [
    requestedPartnerId,
    requestedPartnerName,
    requestedPartnerPhoto,
    isLoadingChats,
    chats,
    openChatDetail,
  ]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !selectedConversation || isSendingMessage) return;

    setIsSendingMessage(true);
    setMessageError(null);
    try {
      const result = await sendMessage({
        receiverId: selectedConversation.partnerId,
        content: text.trim(),
      });
      setSelectedConversation((current) =>
        current?.partnerId === selectedConversation.partnerId
          ? {
              ...current,
              isMatched: result.isMatched,
              messagesRemaining: result.messagesRemaining,
              messages: [
                ...current.messages,
                {
                  id: result.message.id,
                  sender: 'user',
                  text: result.message.content || '',
                  time: new Date(result.message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                },
              ],
            }
          : current,
      );
      setInputText('');
    } catch (error) {
      setMessageError(
        error instanceof Error ? error.message : 'Message could not be sent.',
      );
      console.warn('Failed to send message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleLikePartner = async () => {
    if (!selectedConversation || isLikingPartner) return;
    setIsLikingPartner(true);
    setMessageError(null);
    try {
      await likeConversation(selectedConversation.partnerId);
      setSelectedConversation((current) =>
        current?.partnerId === selectedConversation.partnerId
          ? { ...current, isMatched: true, messagesRemaining: null }
          : current,
      );
      await loadChats();
    } catch (error) {
      setMessageError(
        error instanceof Error ? error.message : 'Unable to create the match.',
      );
      console.warn('Failed to like chat partner:', error);
    } finally {
      setIsLikingPartner(false);
    }
  };

  const hasIncomingMessage = Boolean(
    selectedConversation?.messages.some((message) => message.sender === 'contact'),
  );
  const preMatchLimitReached = Boolean(
    selectedConversation &&
      !selectedConversation.isMatched &&
      selectedConversation.messagesRemaining === 0,
  );

  // RENDER DETAILED CHAT VIEW (WITH BACK NAVIGATION)
  if (selectedConversation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContainer}>
          {/* Header with Back Button */}
          <View style={styles.detailHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setSelectedConversation(null)}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back-outline" size={22} color="#111827" />
            </TouchableOpacity>
            <Image source={selectedConversation.avatar} style={styles.detailAvatar} />
            <View style={styles.detailHeaderInfo}>
              <Text style={styles.detailHeaderName}>{selectedConversation.name}</Text>
              <View style={styles.onlineStatusRow}>
                  {selectedConversation.isOnline && <View style={styles.greenDot} />}
                  <Text style={styles.onlineStatusText}>
                    {selectedConversation.isOnline ? 'Active now' : 'Offline'}
                  </Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerActionBtn}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Audio Call"
              >
                <Ionicons name="call-outline" size={22} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerActionBtn}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Video Call"
              >
                <Ionicons name="videocam-outline" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages Area */}
          <ScrollView
            ref={messagesScrollRef}
            style={{ flex: 1, paddingHorizontal: 16 }}
            contentContainerStyle={{ paddingVertical: 16, gap: 10 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              messagesScrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {!selectedConversation.isMatched && hasIncomingMessage ? (
              <View style={styles.likePrompt}>
                <Text style={styles.likePromptTitle}>
                  Do you like {selectedConversation.name}?
                </Text>
                <Text style={styles.likePromptBody}>
                  Like them to make a match and unlock unlimited messages.
                </Text>
                <TouchableOpacity
                  style={styles.likePromptButton}
                  onPress={() => void handleLikePartner()}
                  disabled={isLikingPartner}
                  activeOpacity={0.8}
                >
                  <Ionicons name="heart" size={16} color="#FFFFFF" />
                  <Text style={styles.likePromptButtonText}>Like &amp; match</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {isLoadingMessages && selectedConversation.messages.length === 0 ? (
              <ActivityIndicator color="#0D7A74" />
            ) : selectedConversation.messages.length === 0 ? (
              <Text style={styles.emptyConversationText}>
                You’re connected. Say hello to start your conversation.
              </Text>
            ) : null}
            {selectedConversation.messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.chatBubble,
                  msg.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleContact,
                ]}
              >
                <Text
                  style={[
                    styles.chatBubbleText,
                    msg.sender === 'user' ? styles.chatBubbleTextUser : styles.chatBubbleTextContact,
                  ]}
                >
                  {msg.text}
                </Text>
                <Text
                  style={[
                    styles.chatBubbleTime,
                    msg.sender === 'user' ? styles.chatBubbleTimeUser : styles.chatBubbleTimeContact,
                  ]}
                >
                  {msg.time}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Quick Reply Chips */}
          <View style={styles.quickPromptsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <TouchableOpacity
                style={styles.quickPromptChip}
                onPress={() => handleSendMessage('Hey there! 👋')}
              >
                <Text style={styles.quickPromptText}>Hey there! 👋</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickPromptChip}
                onPress={() => handleSendMessage('Coffee this weekend? ☕')}
              >
                <Text style={styles.quickPromptText}>Coffee this weekend? ☕</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickPromptChip}
                onPress={() => handleSendMessage('Free for a quick call? 📞')}
              >
                <Text style={styles.quickPromptText}>Free for a call? 📞</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {messageError ? (
            <Text style={styles.messageErrorText}>{messageError}</Text>
          ) : null}

          {/* Input Bar */}
          {preMatchLimitReached ? (
            <Text style={styles.messageLimitText}>
              You’ve sent your two messages. Wait for {selectedConversation.name}
              {' '}to reply or like you to unlock unlimited chat.
            </Text>
          ) : (
            <>
              {!selectedConversation.isMatched ? (
                <Text style={styles.messageLimitText}>
                  {selectedConversation.messagesRemaining ?? 2} introductory
                  {' '}message{selectedConversation.messagesRemaining === 1 ? '' : 's'} left
                </Text>
              ) : null}
              <View style={styles.chatInputBar}>
                <TextInput
                  style={styles.chatTextInput}
                  placeholder={`Message ${selectedConversation.name}...`}
                  placeholderTextColor="#9CA3AF"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={() => void handleSendMessage()}
                  editable={!isSendingMessage}
                />
                <TouchableOpacity
                  style={styles.chatSendBtn}
                  onPress={() => void handleSendMessage()}
                  disabled={isSendingMessage}
                  activeOpacity={0.8}
                >
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // RENDER DETAILED CALL LOG VIEW (WITH BACK NAVIGATION)
  if (selectedCall) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContainer}>
          <View style={styles.detailHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setSelectedCall(null)}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back-outline" size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.detailHeaderTitle}>Call Details</Text>
          </View>

          <View style={styles.callDetailCard}>
            <Image source={selectedCall.avatar} style={styles.callDetailAvatar} />
            <Text style={styles.callDetailName}>{selectedCall.name}</Text>
            <Text style={styles.callDetailSub}>{selectedCall.label} • {selectedCall.duration}</Text>
            <Text style={styles.callDetailTime}>{selectedCall.timestamp}</Text>

            <View style={styles.callActionRow}>
              <TouchableOpacity style={styles.callActionCircleBtn} activeOpacity={0.8}>
                <Ionicons name="call" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.callActionCircleBtn, { backgroundColor: '#0EA5E9' }]} activeOpacity={0.8}>
                <Ionicons name="videocam" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // MAIN CHAT LIST SCREEN (MESSAGES TAB & CALLS TAB)
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {/* Header Title */}
        {showHeaderBar && <HeaderStatusBar title="Chat" />}

        {/* Sub-header Navigation Tabs (Messages | Calls) */}
        <View style={styles.subTabBar}>
          <TouchableOpacity
            style={styles.subTabButton}
            activeOpacity={0.8}
            onPress={() => setActiveTab('messages')}
          >
            <Text
              style={[
                styles.subTabText,
                activeTab === 'messages' && styles.activeSubTabText,
              ]}
            >
              Messages
            </Text>
            {activeTab === 'messages' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.subTabButton}
            activeOpacity={0.8}
            onPress={() => setActiveTab('calls')}
          >
            <Text
              style={[
                styles.subTabText,
                activeTab === 'calls' && styles.activeSubTabText,
              ]}
            >
              Calls
            </Text>
            {activeTab === 'calls' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Search Bar & Filter Button */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for Near by location"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={22} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* TAB 1: MESSAGES LIST VIEW (chatmessage 33) */}
        {activeTab === 'messages' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Section Header: Recent */}
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent</Text>
            </View>

            {/* Chat List Items */}
            {isLoadingChats && chats.length === 0 ? (
              <ActivityIndicator color="#0D7A74" style={styles.listStatus} />
            ) : chatsError && chats.length === 0 ? (
              <Text style={styles.listStatusText}>{chatsError}</Text>
            ) : filteredChats.length === 0 ? (
              <Text style={styles.listStatusText}>
                {searchQuery
                  ? 'No chats match your search.'
                  : 'No conversations yet. When you match and start a chat, it will appear here.'}
              </Text>
            ) : filteredChats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatRow}
                activeOpacity={0.7}
                onPress={() => openChatDetail(chat)}
              >
                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                  <Image source={chat.avatar} style={styles.avatarImage} />
                  {chat.isOnline && <View style={styles.onlineDot} />}
                </View>

                {/* Content */}
                <View style={styles.chatContent}>
                  <Text style={styles.nameText}>{chat.name}</Text>
                  <Text style={styles.messageText} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                </View>

                {/* Meta: Time & Status/Badge */}
                <View style={styles.metaContainer}>
                  <Text style={styles.timeText}>{chat.timestamp}</Text>
                  <View style={styles.statusBadgeWrapper}>
                    {chat.unreadCount ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{chat.unreadCount}</Text>
                      </View>
                    ) : chat.status === 'read' ? (
                      <Ionicons name="checkmark-done" size={18} color="#2CB67D" />
                    ) : chat.status === 'delivered' ? (
                      <Ionicons name="checkmark-done" size={18} color="#9CA3AF" />
                    ) : chat.status === 'sent' ? (
                      <Ionicons name="checkmark" size={18} color="#9CA3AF" />
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          /* TAB 2: CALLS LIST VIEW (chatcalls 34) */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Section Header: Recent */}
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent</Text>
            </View>

            {/* Calls List Items */}
            {filteredCalls.map((call) => (
              <TouchableOpacity
                key={call.id}
                style={styles.chatRow}
                activeOpacity={0.7}
                onPress={() => setSelectedCall(call)}
              >
                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                  <Image source={call.avatar} style={styles.avatarImage} />
                </View>

                {/* Call info */}
                <View style={styles.chatContent}>
                  <Text style={styles.nameText}>{call.name}</Text>
                  <View style={styles.callTypeRow}>
                    <Ionicons
                      name={call.type === 'video' ? 'videocam-outline' : 'call-outline'}
                      size={15}
                      color="#2CB67D"
                      style={{ marginRight: 5 }}
                    />
                    <Text style={styles.callTypeText}>{call.label}</Text>
                  </View>
                </View>

                {/* Right Meta: Timestamp & Duration */}
                <View style={styles.metaContainer}>
                  <Text style={styles.timeText}>{call.timestamp}</Text>
                  <Text style={styles.durationText}>{call.duration}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {showTabBar && <CustomTabBar />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    // paddingTop:10,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  /* Sub Tab Bar */
  subTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 20,
    marginTop: 4,
  },
  subTabButton: {
    marginRight: 36,
    paddingVertical: 10,
    position: 'relative',
    alignItems: 'center',
  },
  subTabText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  activeSubTabText: {
    color: '#0CBEC6',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#0CBEC6',
    borderRadius: 2,
  },
  /* Search Bar */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13,
    color: '#111827',
    paddingVertical: 0,
  },
  filterButton: {
    marginLeft: 12,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* Recent Section Header */
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 14,
  },
  recentTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  /* List Rows */
  scrollContent: {
    paddingBottom: 20,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F1F5F9',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0CBEC6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  messageText: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  callTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callTypeText: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  metaContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  timeText: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  durationText: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
  },
  statusBadgeWrapper: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0CBEC6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  /* Detailed Views (Conversation & Calls) */
  detailHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  backBtn: {
    padding: 6,
  },
  detailAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  detailHeaderInfo: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailHeaderName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  detailHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0CBEC6',
  },
  onlineStatusText: {
    fontSize: 11.5,
    color: '#0CBEC6',
    fontWeight: '600',
  },
  emptyConversationText: {
    alignSelf: 'center',
    maxWidth: 280,
    marginTop: 24,
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  messageErrorText: {
    marginHorizontal: 16,
    marginBottom: 8,
    color: '#B91C1C',
    fontSize: 12,
  },
  messageLimitText: {
    marginHorizontal: 16,
    marginBottom: 8,
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
  },
  likePrompt: {
    alignSelf: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#EAF7F5',
    marginBottom: 8,
  },
  likePromptTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  likePromptBody: {
    marginTop: 4,
    color: '#4B5563',
    fontSize: 13,
    textAlign: 'center',
  },
  likePromptButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#0D7A74',
  },
  likePromptButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listStatus: {
    marginTop: 32,
  },
  listStatusText: {
    marginHorizontal: 24,
    marginTop: 32,
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  chatBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  chatBubbleContact: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#0CBEC6',
    borderBottomRightRadius: 4,
  },
  chatBubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatBubbleTextContact: {
    color: '#1F2937',
  },
  chatBubbleTextUser: {
    color: '#FFFFFF',
  },
  chatBubbleTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatBubbleTimeContact: {
    color: '#9CA3AF',
  },
  chatBubbleTimeUser: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickPromptsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  quickPromptChip: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  quickPromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0CBEC6',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10,
  },
  chatTextInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F3F4F6',
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111827',
  },
  chatSendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0CBEC6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callDetailCard: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  callDetailAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  callDetailName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  callDetailSub: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  callDetailTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 32,
  },
  callActionRow: {
    flexDirection: 'row',
    gap: 24,
  },
  callActionCircleBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0CBEC6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});
