import Head from 'next/head'
import { connectToDatabase } from '../util/mongodb'
import styled from 'styled-components'
import { useState, useEffect, useRef  } from 'react'
import socketIOClient from 'socket.io-client';
import tmi from 'tmi.js';
import 'dotenv/config';
import axios from 'axios';
import fetch from 'isomorphic-unfetch';
import io from 'socket.io-client';

const port = parseInt(process.env.PORT, 10) || 3000;

async function getSteamUsername(steamUID) {
  try {
    const response = await fetch(`https://king-prawn-app-9ucth.ondigitalocean.app/api/getSteamUsername?steamUID=${steamUID}`);
    if (response.ok) {
      const data = await response.json();
      return data.username;
    } else {
      console.error('User not found');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving Steam username:', error);
    return null;
  }
}

async function getNickname(steamUID) {
  try {
    const response = await fetch(`https://king-prawn-app-9ucth.ondigitalocean.app/api/getNickname?steamUID=${steamUID}`);
    if (response.ok) {
      const data = await response.json();
      return data.nickname;
    } else {
      console.error('Nickname not found');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving nickname:', error);
    return null;
  }
}

export default function Home({teamNames}) {
  const [teams, setTeams] = useState(teamNames || []);
  const [teamOne, setTeamOne] = useState(null);
  const [teamTwo, setTeamTwo] = useState(null);
  const [teamOnePlayers, setTeamOnePlayers] = useState([]);
  const [teamTwoPlayers, setTeamTwoPlayers] = useState([]);
  const [logs, setLogs] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(`https://king-prawn-app-9ucth.ondigitalocean.app`);
    socketRef.current.connect();

    socketRef.current.on('event', async (data) => {
      console.log('Event received:', data);
      const userId = data.data?.userId;
      const actionId = data.id;
      const gameProcess = data.data?.gameProcess;
      const username = await getNickname(userId);
      if (userId && actionId && username) {
        setBuffer((prevBuffer) => [...prevBuffer, { userId, actionId, username }]);
      }
    });

    const updateInterval = setInterval(() => {
      setBuffer((prevBuffer) => {
        if (prevBuffer.length > 0) {
          const { userId, actionId, username } = prevBuffer[0];
          console.log('Processing buffer:', userId, actionId, username);
          if (actionId === 3) {
            setUsernames((prevUsernames) => {
              if (!prevUsernames.includes(username)) {
                return [...prevUsernames, username];
              }
              return prevUsernames;
            });
          } else if (actionId === 4) {
            setUsernames((prevUsernames) => {
              return prevUsernames.filter((u) => u !== username);
            });
          }
          return prevBuffer.slice(1);
        }
        return prevBuffer;
      });
    }, 30000); // 30 seconds interval

    return () => {
      clearInterval(updateInterval);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);
  

  const handleTeamSelect = async (teamName, setTeamFunction, setPlayersFunction) => {
    try {
      const response = await fetch(`https://king-prawn-app-9ucth.ondigitalocean.app/api/getTeamDetails?teamName=${teamName}`);
      if (response.ok) {
        const data = await response.json();
        setTeamFunction(teamName);
        setPlayersFunction(data.players);
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
  };

  const handleTeamOneSelect = (event) => {
    const teamId = event.target.value;
    handleTeamSelect(teamId, setTeamOne, setTeamOnePlayers);
  };

  const handleTeamTwoSelect = (event) => {
    const teamId = event.target.value;
    handleTeamSelect(teamId, setTeamTwo, setTeamTwoPlayers);
  };

  // return (
  //   <div>
  //     <h1>Usernames</h1>
  //   </div>
  // );
  return (
    <div>
      {/* Teams selection */}
      <div>
        <label>
          Team One:
          <select onChange={handleTeamOneSelect} value={teamOne || ''}>
            <option value="">Select a team</option>
            {teams.map((team, index) => (
              <option key={index} value={team}>
                {team}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Team Two:
          <select onChange={handleTeamTwoSelect} value={teamOne || ''}>
            <option value="">Select a team</option>
            {teams.map((team, index) => (
              <option key={index} value={team}>
                {team}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Players display */}
      <div>
        <h2>{teamOne?.name} Players Team One</h2>
        <ul>
          {teamOnePlayers.map((player) => (
            <li key={player.uuid}>
              {player.name} - {player.uuid}
              {/* Add status circle here */}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>{teamTwo?.name} Players Team Two</h2>
        <ul>
          {teamTwoPlayers.map((player) => (
            <li key={player.uuid}>
              {player.name} - {player.uuid}
              {/* Add status circle here */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export async function getStaticProps({ params }) {
    const { db } = await connectToDatabase();
    let teamNames = [];

    try {
      const params2 = {
        'licenseKey': '62e448abcd415a26',
        'serviceId': 'CS2',
      };

      const responseFromUnregister = await axios.delete('https://secure-api.akros.ac/v1/IWebHook/Unregister?secret=testshitout&uri=https://king-prawn-app-9ucth.ondigitalocean.app/api/events');
      console.log('Registration Response:', responseFromUnregister.data);

      const responseFromUnregister2 = await axios.delete('https://secure-api.akros.ac/v1/IWebHook/Unregister?secret=testshitout&uri=https://king-prawn-app-9ucth.ondigitalocean.app/api/events');
      console.log('Registration Response:', responseFromUnregister2.data);

      const response = await axios.get('https://secure-api.akros.ac/v1/ISession/ValidateLicense?licenseKey=62e448abcd415a26&serviceId=CS2', { params: params2 });
      console.log('Validation Response:', response.data);
      const responseData = response.data;

      const paramsToRegister = {
        'licenseKey': '62e448abcd415a26',
        'serviceId': 'default',
        'secret': 'testshitout',
        'uri': 'https://king-prawn-app-9ucth.ondigitalocean.app/api/events',
        'gameProcess': 'cs2.exe'
      };
      
      const responseFromRegister = await axios.post('https://secure-api.akros.ac/v1/IWebHook/Register', paramsToRegister);
      console.log('Registration Response:', responseFromRegister.data);


      const responseFromTeams = await axios.get('https://king-prawn-app-9ucth.ondigitalocean.app/api/getTeams');
      if (responseFromTeams.status === 200) {
          teamNames = responseFromTeams.data.teams;
          console.log('teamNames', teamNames);
      } else {
          console.error('Teams not found');
      }


    } catch (error) {
      console.error('Error registering webhook:', error);
    }
    return {
      props: {teamNames: teamNames},
    };
}