# **SAMM - Safe Anonymous Mail Module UI**

### **Overview**

The UI is implemented as a Safe React App built on the Safe App SDK. This application can be [added as a custom app](https://help.safe.global/en/articles/40859-add-a-custom-safe-app) in the standard Safe wallet UI.

The UI is available only to SAMM members' emails and allows them to:

- Monitor the status of each SAMM transaction.
- Generate tx data for the Initiation email.
- Generate tx data for changing SAMM parameters (these transactions will be executed through the classic Safe Wallet UI on behalf of associated Safe owners).

---

### **File Structure**

Here's a high-level look at the project structure:

```
├── public
│   ├── assets
│   └── manifest.json
├── src
│   ├── app
│   │    ├── example-page-folder
│   │    └── page.tsx
│   ├── components
│   ├── config
│   ├── containers
│   ├── helpers
│   ├── hooks
│   ├── lib
│   ├── store
│   ├── types
│   └── utils
├── tailwind.config.ts
└── tsconfig.json
```

Key directories:

- **`public`**: Contains the static images and icons, and also a custom Safe App configuration `manifest.json`.
- **`app`**: Contains the main pages and layouts for the Next.js application.
- **`components`**: Reusable UI components (e.g., buttons, sidebar).
- **`utils` and `helpers`**: Utilities and helper functions for blockchain, API, and UI logic.
- **`config`**: Configuration files for SDKs and APIs.
- **`hooks`**: Custom React hooks for managing state and effects.
- **`containers`**: Domain-specific components for managing SAMM workflows.

---

### **Dependencies**

The project uses the following key dependencies:

- **Core Libraries**:
  - `next`: Framework for server-side rendering and static site generation.
- **Safe SDK**:
  - `@safe-global/safe-apps-react-sdk`: For integrating with the Safe Wallet.
  - `@safe-global/protocol-kit`: For interacting with Safe contracts.
- **Styling**:
  - `tailwindcss`: Utility-first CSS framework.
  - `shadcn/ui`: A component library built on TailwindCSS for rapidly building modern, accessible, and responsive UIs.
- **Blockchain Integration**:
  - `ethers`: Library for blockchain interactions and smart contract integration.
- **State Management**
  - `zustand`: State manager.
- **Form Validation**
  - `react-hook-form`: Flexible form validation and management.
  - `zod`: Schema validation.

---

### **Compilation**

Because of deep dependency conflicts with the Safe template, you should use the `--legacy-peer-deps` flag when installing dependencies.

1. Clone the repository:

   ```bash
   git clone https://github.com/oxor-io/samm-frontend
   cd samm
   ```

2. Install dependencies:

   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

---

### **API Integration**

SAMM integrates with:

- **Safe SDK** for interacting with Safe multisig wallets.
- **Relayer Service**: Backend API for handling emails, DKIM verification, and ZK proof generation.

#### API reference: [SAMM API Docs](https://samm.oxor.io/docs)

---

### **Testing**

Testing is in progress, leveraging the following tools:

- **Testing Library**: React Testing Library for UI testing.
- **Jest**: For unit tests.

Run tests using:

```bash
npm run test
```
