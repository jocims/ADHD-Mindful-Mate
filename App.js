import React, { Component } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Login from './src/Components/Login'; // Import the Login component

class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Use the Login component */}
          <Login />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgrey',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
  },
});

export default App;
