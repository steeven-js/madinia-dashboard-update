import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { SystemSettingsView } from 'src/sections/system-settings/view';

// ----------------------------------------------------------------------

const metadata = { title: `System Settings - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <SystemSettingsView />
    </>
  );
}
