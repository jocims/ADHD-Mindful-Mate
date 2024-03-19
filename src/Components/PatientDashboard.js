import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from './UserDataManager';

const PatientDashboard = () => {
  const navigation = useNavigation();
  const { userData } = useUserData();
  const [storedUserToken, setStoredUserToken] = useState(null);
  const [feelGoodMessage, setFeelGoodMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');

  useEffect(() => {
    const fetchFeelGoodMessage = async () => {
      try {
        const storedQuote = await ReactNativeAsyncStorage.getItem('feelGoodQuote');
        const storedDate = await ReactNativeAsyncStorage.getItem('feelGoodQuoteDate');

        // Check if there is a stored quote for today
        if (storedQuote && storedDate === new Date().toISOString().split('T')[0]) {
          setFeelGoodMessage(storedQuote);
        } else {
          // Fetch the inspirational quote from the API
          const response = await fetch(`https://favqs.com/api/qotd`);
          const data = await response.json();

          // Check if a quote is available for the date
          if (data.quote) {
            const quote = data.quote.body;
            setFeelGoodMessage(quote);
            // Store the quote and its date
            await ReactNativeAsyncStorage.setItem('feelGoodQuote', quote);
            await ReactNativeAsyncStorage.setItem('feelGoodQuoteDate', new Date().toISOString().split('T')[0]);
          } else {
            setFeelGoodMessage("No quote available for this day.");
          }
        }
      } catch (error) {
        console.error('Error fetching feel-good message:', error);
        setFeelGoodMessage("Failed to fetch quote.");
      }
    };

    // Fetch the feel-good message when the component mounts
    fetchFeelGoodMessage();

    // Check if there is a stored emoji for today
    const fetchSelectedEmoji = async () => {
      try {
        const storedEmoji = await ReactNativeAsyncStorage.getItem('selectedEmoji');
        const storedDate = await ReactNativeAsyncStorage.getItem('selectedEmojiDate');

        // Check if there is a stored emoji for today
        if (storedEmoji && storedDate === new Date().toISOString().split('T')[0]) {
          setSelectedEmoji(storedEmoji);
        }
      } catch (error) {
        console.error('Error fetching selected emoji:', error);
      }
    };

    fetchSelectedEmoji();
  }, []);

  useEffect(() => {
    console.log('User Data Changed:', userData);

    // Check if the storedUserToken is updated before logging
    if (storedUserToken !== null) {
      console.log('Stored User Token in PatientDashboard:', storedUserToken);
    }
  }, [userData, storedUserToken]);

  // Function to handle log out
  const handleLogout = async () => {
    // Clear user token and role from AsyncStorage
    await ReactNativeAsyncStorage.removeItem('userToken');
    await ReactNativeAsyncStorage.removeItem('userRole');

    // Navigate back to the login screen
    navigation.navigate('FirstScreen');
  };

  // Function to handle emoji selection
  const handleEmojiSelection = async (emoji) => {
    setSelectedEmoji(emoji);
    // Store the selected emoji and its date
    await ReactNativeAsyncStorage.setItem('selectedEmoji', emoji);
    await ReactNativeAsyncStorage.setItem('selectedEmojiDate', new Date().toISOString().split('T')[0]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleLogout} style={styles.logout}>
        <Image source={require('../logout.png')} style={styles.logoutImg} />
      </TouchableOpacity>
      <Image source={require('../logo750-75.png')} style={styles.img} />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.properContent}>
        <Text style={styles.introduction}>Hello {userData ? userData.firstName + '!' : '!'}</Text>
        <View style={styles.fellGoodMessageContainer}>
          <Text style={styles.feelGoodMessage}>{feelGoodMessage}</Text>
        </View>
        <View style={styles.emojiContainer}>
          <TouchableOpacity
            onPress={() => handleEmojiSelection('😢')}
            style={[styles.emojiButton, selectedEmoji === '😢' && styles.selectedEmoji]}
          >
            <Text style={[styles.emoji, selectedEmoji === '😢' && styles.selectedEmojiText]}>😢</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEmojiSelection('😔')}
            style={[styles.emojiButton, selectedEmoji === '😔' && styles.selectedEmoji]}
          >
            <Text style={[styles.emoji, selectedEmoji === '😔' && styles.selectedEmojiText]}>😔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEmojiSelection('😐')}
            style={[styles.emojiButton, selectedEmoji === '😐' && styles.selectedEmoji]}
          >
            <Text style={[styles.emoji, selectedEmoji === '😐' && styles.selectedEmojiText]}>😐</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEmojiSelection('😊')}
            style={[styles.emojiButton, selectedEmoji === '😊' && styles.selectedEmoji]}
          >
            <Text style={[styles.emoji, selectedEmoji === '😊' && styles.selectedEmojiText]}>😊</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEmojiSelection('😄')}
            style={[styles.emojiButton, selectedEmoji === '😄' && styles.selectedEmoji]}
          >
            <Text style={[styles.emoji, selectedEmoji === '😄' && styles.selectedEmojiText]}>😄</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.functionalities}>
          <TouchableOpacity style={[styles.btn, { marginRight: 10 }]} onPress={() => navigation.navigate('PatientRegistration')}>
            <Text style={styles.btnText}>Weekly Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('PatientRegistration')}>
            <Text style={styles.btnText}>Game</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.functionalities}>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('PatientRegistration')}>
            <Text style={styles.btnText}>Meditation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('PatientRegistration')}>
            <Text style={styles.btnText}>Deep Breathing</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.functionalities}>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('PatientRegistration')}>
            <Text style={styles.btnText}>Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('PatientRegistration')}>
            <Text style={styles.btnText}>Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgrey',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    position: 'absolute',
    width: 337.5,
    height: 67.5,
    top: 10,
    left: 1, // Adjust the right position as needed
  },
  logout: {
    position: 'absolute',
    top: 15,
    right: 15, // Adjust the right position as needed
  },
  logoutImg: {
    width: 50,
    height: 50,
  },
  functionalities: {
    flexDirection: 'row',
    justifyContent
      : 'space-between',
  },
  properContent: {
    marginTop: 85,
  },
  btn: {
    backgroundColor: '#AF3E76',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'SourceCodePro-Medium',
  },
  list: {
    backgroundColor: '#5F6EB5',
    padding: 10,
    borderRadius: 5,
    width: 150,
    height: 80,
    margin: 2,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introduction: {
    fontSize: 25,
    textAlign: 'center',
    color: '#0C5E51',
    fontFamily: 'SourceCodePro-Bold',
  },
  feelGoodMessage: {
    fontSize: 12,
    textAlign: 'center',
    color: '#E0E0E0',
    fontFamily: 'SourceCodePro-Regular',
  },
  fellGoodMessageContainer: {
    backgroundColor: '#5F6EB5',
    padding: 10,
    borderRadius: 5,
    width: 315,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  emojiButton: {
    paddingHorizontal: 10,
  },
  emoji: {
    fontSize: 30,
  },
  selectedEmoji: {
    backgroundColor: 'gray',
    borderRadius: 100,
    elevation: 5, // Shadow effect
  },
});

export default PatientDashboard;