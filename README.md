# 🎭 Mafioso Game #

A criminal empire building game built as a World Chain Mini App. Build your reputation, commit crimes, travel between cities, collect cars, and engage in player vs player combat.

## Features

- 🏆 **Rank System**: Progress through 20 different mafia ranks
- 💰 **Crime System**: Commit various crimes with different risk/reward ratios
- 🌍 **City Travel**: Operate in 5 different cities worldwide
- 🚗 **Vehicle Collection**: Steal, buy, and manage cars with different stats
- 🔫 **Combat System**: Hunt other players for respect and their vehicles
- 🏪 **Equipment Store**: Buy guns and protection to enhance your capabilities
- 🏦 **Swiss Bank**: Safely store money that survives death

## Getting Started

1. Copy environment variables: `cp .env.example .env.local`
2. Follow the instructions in the .env.local file
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`
5. Set up ngrok tunnel: `ngrok http 3000`
6. Generate auth secret: `npx auth secret`
7. Update `AUTH_URL` in .env.local to your ngrok URL
8. Configure your app in the World Developer Portal

## Game Mechanics

### Crimes
- **Pickpocket**: Always succeeds, low reward
- **Grand Theft Auto**: Steal random cars
- **Bank Heist**: High-risk, high-reward crimes for advanced players

### Combat
- Search for players by username (3 hour search time)
- Shooting costs bullets based on target's protection
- Successful kills steal all target's cars
- Defeated players reset but keep Swiss Bank money

### Equipment
- **Guns**: Reduce bullet costs when shooting
- **Protection**: Increase bullets needed for others to kill you
- **Cars**: Provide bonuses and can be melted for bullets

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Authentication**: NextAuth.js with World ID
- **Blockchain**: World Chain integration via MiniKit
- **UI Components**: World Coin Mini Apps UI Kit

## Authentication

The app uses World ID for secure authentication. Users log in with their World App wallet and can optionally verify their identity with World ID's orb or device verification.

## Environment Variables

See `.env.example` for required environment variables including:
- World App configuration
- Authentication secrets  
- Database connection (if using backend)

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint

## Sacred Components

⚠️ **DO NOT MODIFY** these authentication and MiniKit components:
- `/src/auth/` - Authentication logic
- `/src/app/api/auth/` - Auth API routes
- `/src/app/api/wallet-auth/nonce/` - Nonce generation
- `/src/app/api/verify-proof/` - World ID proof verification
- `/src/components/AuthButton/` - Login component
- `/src/components/UserInfo/` - User session display
- `/src/components/Verify/` - World ID verification
- `.env` file - Environment variables

## Game Pages

- `/` - Login page
- `/home` - User dashboard with game entry
- `/dashboard` - Game overview and stats
- `/crimes` - Crime selection and execution
- `/travel` - City travel interface
- `/store` - Equipment and vehicle shop
- `/garage` - Vehicle management
- `/shoot` - Player vs player combat

## License

MIT