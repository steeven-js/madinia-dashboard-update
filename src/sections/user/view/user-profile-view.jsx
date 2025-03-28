import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { usePathname, useSearchParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { _userAbout, _userFeeds, _userFriends, _userGallery, _userFollowers } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// import { ProfileHome } from '../profile-home';
import { ProfileCover } from '../profile-cover';
// import { ProfileFriends } from '../profile-friends';
// import { ProfileGallery } from '../profile-gallery';
// import { ProfileFollowers } from '../profile-followers';
import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const NAV_ITEMS = [
  {
    value: '',
    label: 'Profile',
    icon: <Iconify width={24} icon="solar:user-id-bold" />,
  },
  // {
  //   value: 'followers',
  //   label: 'Followers',
  //   icon: <Iconify width={24} icon="solar:heart-bold" />,
  // },
  // {
  //   value: 'friends',
  //   label: 'Friends',
  //   icon: <Iconify width={24} icon="solar:users-group-rounded-bold" />,
  // },
  // {
  //   value: 'gallery',
  //   label: 'Gallery',
  //   icon: <Iconify width={24} icon="solar:gallery-wide-bold" />,
  // },
];

// ----------------------------------------------------------------------

// Si role === 'super_admin' alors on affiche le label 'Super Administrateur'
// Si role === 'dev' alors on affiche le label 'Développeur'
// Si role === 'admin' alors on affiche le label 'Administrateur'
// Si role === 'user' alors on affiche le label 'Utilisateur'

const getRoleLabel = (role) => {
  switch (role) {
    case 'super_admin':
      return 'Super Administrateur';
    case 'dev':
      return 'Développeur';
    case 'admin':
      return 'Administrateur';
    case 'user':
      return 'Utilisateur';
    default:
      return role;
  }
};

// ----------------------------------------------------------------------

const TAB_PARAM = 'tab';

export function UserProfileView({ currentUser, currentUserProfile }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedTab = searchParams.get(TAB_PARAM) ?? '';

  // console.log('currentUser', currentUser);
  // console.log('currentUserProfile', currentUserProfile);

  const createRedirectPath = (currentPath, query) => {
    const queryString = new URLSearchParams({ [TAB_PARAM]: query }).toString();
    return query ? `${currentPath}?${queryString}` : currentPath;
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Profile"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: currentUser?.displayName },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: 3, height: 290 }}>
        <ProfileCover
          role={getRoleLabel(currentUserProfile.role)}
          name={currentUser?.displayName}
          avatarUrl={currentUser?.photoURL}
          coverUrl={currentUserProfile.coverUrl}
        />

        <Box
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            px: { md: 3 },
            display: 'flex',
            position: 'absolute',
            bgcolor: 'background.paper',
            justifyContent: { xs: 'center', md: 'flex-end' },
          }}
        >
          <Tabs value={selectedTab}>
            {NAV_ITEMS.map((tab) => (
              <Tab
                component={RouterLink}
                key={tab.value}
                value={tab.value}
                icon={tab.icon}
                label={tab.label}
                href={createRedirectPath(pathname, tab.value)}
              />
            ))}
          </Tabs>
        </Box>
      </Card>

      {/* {selectedTab === '' && <ProfileHome info={_userAbout} posts={_userFeeds} />}

      {selectedTab === 'followers' && <ProfileFollowers followers={_userFollowers} />}

      {selectedTab === 'friends' && (
        <ProfileFriends
          friends={_userFriends}
          searchFriends={searchFriends}
          onSearchFriends={handleSearchFriends}
        />
      )}

      {selectedTab === 'gallery' && <ProfileGallery gallery={_userGallery} />} */}

      <BlankView />
    </DashboardContent>
  );
}
