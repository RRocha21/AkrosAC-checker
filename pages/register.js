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
    const response = await fetch(`https://plankton-app-kjs3q.ondigitalocean.app/api/getSteamUsername?steamUID=${steamUID}`);
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
    const response = await fetch(`https://plankton-app-kjs3q.ondigitalocean.app/api/getNickname?steamUID=${steamUID}`);
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

async function handleTeamSelect(teamName) {
  try {
    const response = await fetch(`https://plankton-app-kjs3q.ondigitalocean.app/api/getTeamDetails?teamName=${teamName}`);
    if (response.ok) {
      const data = await response.json();
      return data.players;
    } else {
      console.error('Team not found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching team details:', error);
    return null;
  }
};

export default function Home({teamNames}) {
  const [teams, setTeams] = useState(teamNames || []);
  const [teamOne, setTeamOne] = useState(null);
  const [teamTwo, setTeamTwo] = useState(null);
  const [teamOnePlayers, setTeamOnePlayers] = useState([]);
  const [teamTwoPlayers, setTeamTwoPlayers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [usernames, setUsernames] = useState([]);
  const [buffer, setBuffer] = useState([]);
  const socketRef = useRef(null); // useRef to keep the socket instance

  useEffect(() => {
    socketRef.current = io(`https://plankton-app-kjs3q.ondigitalocean.app`);
    socketRef.current.connect();

    socketRef.current.on('event', async (data) => {
      // console.log('Event received:', data);
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
          // console.log('Processing buffer:', userId, actionId, username);
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
    }, 1000); // 30 seconds interval

    return () => {
      clearInterval(updateInterval);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);
  


  const handleTeamOneSelect = async (event) => {
    const teamId = event.target.value;
    setTeamOne(teamId);
    const players = await handleTeamSelect(teamId);
    setTeamOnePlayers(players)
  };

  const handleTeamTwoSelect = async (event) => {
    const teamId = event.target.value;
    setTeamTwo(teamId);
    handleTeamSelect(teamId);
    const players = await handleTeamSelect(teamId);
    setTeamTwoPlayers(players)
  };

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
          <select onChange={handleTeamTwoSelect} value={teamTwo || ''}>
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
          {teamOnePlayers.map((player, index) => (
            <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  marginRight: '10px',
                  backgroundColor: usernames.includes(player) ? 'green' : 'red',
                }}
              />
              {player}
              {index === 5 && ' - Stand in'}
              {index === 6 && ' - Coach'}
              {index === 7 && ' - Assistant Coach'}
              {index === 8 && ' - Manager'}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>{teamTwo?.name} Players Team Two</h2>
        <ul>
          {teamTwoPlayers.map((player, index) => (
            <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  marginRight: '10px',
                  backgroundColor: usernames.includes(player) ? 'green' : 'red',
                }}
              />
              {player} 
              {index === 5 && ' - Stand in'}
              {index === 6 && ' - Coach'}
              {index === 7 && ' - Assistant Coach'}
              {index === 8 && ' - Manager'}
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

      const responseFromUnregister = await axios.delete('https://secure-api.akros.ac/v1/IWebHook/Unregister?secret=testshitout&uri=https://plankton-app-kjs3q.ondigitalocean.app/api/events');
      console.log('Registration Response:', responseFromUnregister.data);

      const responseFromUnregister2 = await axios.delete('https://secure-api.akros.ac/v1/IWebHook/Unregister?secret=testshitout&uri=https://plankton-app-kjs3q.ondigitalocean.app/api/events');
      console.log('Registration Response:', responseFromUnregister2.data);

      const response = await axios.get('https://secure-api.akros.ac/v1/ISession/ValidateLicense?licenseKey=62e448abcd415a26&serviceId=CS2', { params: params2 });
      console.log('Validation Response:', response.data);
      const responseData = response.data;

      const paramsToRegister = {
        'licenseKey': '62e448abcd415a26',
        'serviceId': 'default',
        'secret': 'testshitout',
        'uri': 'https://plankton-app-kjs3q.ondigitalocean.app/api/events',
        'gameProcess': 'cs2.exe'
      };
      
      const responseFromRegister = await axios.post('https://secure-api.akros.ac/v1/IWebHook/Register', paramsToRegister);
      console.log('Registration Response:', responseFromRegister.data);


      const responseFromTeams = await axios.get('https://plankton-app-kjs3q.ondigitalocean.app/api/getTeams');
      if (responseFromTeams.status === 200) {
          teamNames = responseFromTeams.data.teams;
          // console.log('teamNames', teamNames);
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