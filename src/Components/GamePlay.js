import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const GamePlay = () => {
  const [shapeStyle, setShapeStyle] = useState({
    width: 0,
    height: 0,
    backgroundColor: 'red',
    display: 'none',
    position: 'absolute',
  });
  const [start, setStart] = useState(false); // State to track if the game has started
  const [startTimer, setStartTimer] = useState(0); // State to track the start time
  const [endTimer, setEndTimer] = useState(0); // State to track the end time
  const [timeTaken, setTimeTaken] = useState(0);
  const [timeTakenList, setTimeTakenList] = useState([]); // State to store all timeTaken values
  const [smallestTime, setSmallestTime] = useState(null); // State to store the smallest timeTaken value
  const [bestScore, setBestScore] = useState(null); // State to store the best score
  const navigation = useNavigation();


  const fetchBestScore = async () => {
    try {
      const userDocRef = doc(db, 'patient', auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      const data = docSnap.data();
      if (data && data.GamePractice) {
        const scores = Object.values(data.GamePractice).map((entry) => entry.gamePracticeScore);
        const best = Math.min(...scores);
        setBestScore(best);
      }
    } catch (error) {
      console.error('Error fetching best score:', error);
    }
  };

  useEffect(() => {
    fetchBestScore();
  }, []);

  const handleStartGame = () => {
    setStart(true);
    setTimeTakenList([]);
    setSmallestTime(null);
    setStartTimer(new Date().getTime());
  };

  const makeShapeAppear = () => {
    const containerWidth = windowWidth * 0.75;
    const containerHeight = containerWidth;

    const top = Math.random() * (containerHeight - 100);
    const left = Math.random() * (containerWidth - 100);
    const width = Math.random() * 100 + 50;
    const borderRadius = Math.random() > 0.5 ? 50 : 0;

    setShapeStyle({
      ...shapeStyle,
      borderRadius,
      backgroundColor: getRandomColor(),
      width,
      height: width,
      top,
      left,
      display: 'flex',
    });

    setStartTimer(new Date().getTime());
  };

  useEffect(() => {
    let timeoutId;
    if (start) {
      timeoutId = setTimeout(makeShapeAppear, Math.random() * 2000 + 2000);
    }
    return () => clearTimeout(timeoutId);
  }, [start]);

  const handleShapeClick = () => {
    setShapeStyle({
      ...shapeStyle,
      display: 'none',
    });

    const end = new Date().getTime();
    const taken = (end - startTimer) / 1000;
    setTimeTaken(taken);

    setTimeTakenList([...timeTakenList, taken]);

    setTimeout(makeShapeAppear, Math.random() * 2000 + 2000);
  };

  const handleEndGame = async () => {
    setStart(false);
    const endTime = new Date().getTime();
    setEndTimer(endTime);
    const duration = (endTime - startTimer) / 1000;

    const smallestTime = Math.min(...timeTakenList);
    setSmallestTime(smallestTime);

    try {
      const userDocRef = doc(db, 'patient', auth.currentUser.uid);

      const gameData = {
        [Date.now().toString()]: {
          gamePracticeScore: smallestTime,
          date: new Date().toISOString().split('T')[0],
          timeDurationOfPractice: duration.toFixed(2),
          weekCommencing: getMonday(new Date()).toISOString().split('T')[0],
        },
      };

      await setDoc(userDocRef, { GamePractice: gameData }, { merge: true });

      fetchBestScore(); // Fetch the best score again after updating the database

      if (timeTakenList.length > 0) {
        // Show scores in an alert
        Alert.alert(
          'Game Over',
          `Your score: ${smallestTime}s\nBest score: ${bestScore !== null ? bestScore + 's' : 'Loading...'}`
        );
      }
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  };

  const getMonday = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Test Your Reactions!</Text>
        <Text>Click on the boxes and circles as quick as you can!</Text>
        <Text style={styles.bold}>Your time: {timeTaken}s</Text>
      </View>

      {start && (
        <View style={styles.gameContainer}>
          <TouchableOpacity style={[styles.shape, shapeStyle]} onPress={handleShapeClick} />
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!start && (
          <TouchableOpacity style={styles.button} onPress={handleStartGame}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        )}
        {start && (
          <TouchableOpacity style={styles.button} onPress={handleEndGame}>
            <Text style={styles.buttonText}>End</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.btnDashboard} onPress={() => navigation.navigate('PatientDashboard')}>
          <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  gameContainer: {
    borderWidth: 2,
    borderColor: 'black',
    width: '100%',
    aspectRatio: 1,
    marginBottom: 20,
    position: 'relative',
  },
  shape: {
    position: 'absolute',
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: '#af3e76',
    width: '30%',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'SourceCodePro-Medium',
  },
  btnDashboard: {
    backgroundColor: '#052458',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    width: 200,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDashboardText: {
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'SourceCodePro-Medium',
  },
});

export default GamePlay;