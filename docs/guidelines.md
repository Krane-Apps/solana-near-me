1. Never use emojis in the code or md files anywhere if you see any make sure to remove them
2. make sure you keep the files short under 500 lines if possible and keep the functions seperate and not in the same UI file, break down the code in proper components that make sense
3. Do not use emojis for icons use react-native-vector-icons for icons properly
4. Make a logger function to log file name and the log and in the contants file keep a variable so we show logs only then dev is set to true, always add logs to the files so we know what is going wrong in case of bugs
5. Use react-native-flash-message for toasts and alerts and never use anything else
6. make a database structure in a file names FIREBASE.md and use that always as the singel source of truth
7. Make sure you handle errors properly when you develop something
8. If you want to create a doc or md file always keep it in the docs folder in the root folder

## Final Clean Folder Structure

```
src/
├── components/          # UI components only
│   ├── ui/             # Base reusable UI components (Button, Card, TextInput)
│   └── common/         # App-specific shared components (AccountInfo, ConnectWalletButton)
├── screens/            # Feature-based screen folders
│   ├── welcome/        # WelcomeScreen + index.ts
│   ├── map/            # MapScreen, MerchantListScreen + index.ts
│   ├── payment/        # PaymentScreen, PaymentSuccessScreen, SolanaPayQR, SendMemoButton + index.ts
│   ├── merchant/       # MerchantRegistrationScreen + index.ts
│   ├── profile/        # UserProfileScreen + index.ts
│   ├── rewards/        # RewardScreen + index.ts
│   └── options/        # OptionsScreen + index.ts
├── hooks/              # Custom React hooks
├── navigation/         # Navigation configuration
├── providers/          # React context providers
└── lib/                # All utilities, data, and configurations
    ├── data/           # Static data and mock data
    ├── firebase/       # Firebase configuration and services
    ├── services/       # External API services (Solana Pay, location, etc.)
    ├── theme/          # Design system (colors, typography, spacing)
    ├── types/          # TypeScript type definitions
    └── utils/          # Utility functions (logger, constants)

docs/
├── FIREBASE.md         # Single source of truth for database structure
├── guidelines.md       # This file
└── other-docs/         # Additional documentation
```


## File Naming Conventions

- Components: PascalCase (UserProfile.tsx)
- Hooks: camelCase starting with 'use' (useAuth.ts)
- Services: camelCase with 'Service' suffix (authService.ts)
- Utils: camelCase (logger.ts, constants.ts)
- Types: index.ts in lib/types folder
- Screens: PascalCase with 'Screen' suffix (WelcomeScreen.tsx)

## Import Patterns

```typescript
// Clean imports using index files
import WelcomeScreen from '../screens/welcome';
import { MapScreen, MerchantListScreen } from '../screens/map';
import { PaymentScreen, SolanaPayQR } from '../screens/payment';

// Shared components
import { Button, Card } from '../components/ui';
import { AccountInfo } from '../components/common';

// Lib imports - all utilities and configurations
import { logger } from '../lib/utils/logger';
import { UI_CONSTANTS } from '../lib/utils/constants';
import { Merchant, LocationCoords } from '../lib/types';
import { SolanaColors, Typography } from '../lib/theme';
import { locationService } from '../lib/services/locationService';
import { useMerchants } from '../lib/firebase';
```

## Implementation Notes

- All files follow the logging pattern with FILE_NAME constant
- Emojis replaced with react-native-vector-icons
- Error handling improved throughout
- TypeScript types centralized in lib/types/index.ts
- Constants organized in lib/utils/constants.ts
- Each screen folder contains related components and index.ts
- Clean import patterns using index files
- Lib folder contains all reusable, non-React-specific code