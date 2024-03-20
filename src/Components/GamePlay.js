import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

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
  const [start, setStart] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);

  const makeShapeAppear = () => {
    const top = Math.random() * (windowHeight - 100); // Subtracting shape height
    const left = Math.random() * (windowWidth - 100); // Subtracting shape width
    const width = Math.random() * 100 + 50;
    const borderRadius = Math.random() > 0.5 ? 50 : 0; // Convert to number

    setShapeStyle({
      ...shapeStyle,
      borderRadius, // Assign numerical value
      backgroundColor: getRandomColor(),
      width,
      height: width,
      top,
      left,
      display: 'flex',
    });

    setStart(new Date().getTime());
  };

  useEffect(() => {
    const timeoutId = setTimeout(makeShapeAppear, Math.random() * 2000 + 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleShapeClick = () => {
    setShapeStyle({
      ...shapeStyle,
      display: 'none',
    });

    const end = new Date().getTime();
    const taken = (end - start) / 1000;
    setTimeTaken(taken);

    setTimeout(makeShapeAppear, Math.random() * 2000 + 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Your Reactions!</Text>
      <Text>Click on the boxes and circles as quick as you can!</Text>
      <Text style={styles.bold}>Your time: {timeTaken}s</Text>
      <TouchableOpacity style={[styles.shape, shapeStyle]} onPress={handleShapeClick} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  shape: {
    position: 'absolute',
  },
});

export default GamePlay;
