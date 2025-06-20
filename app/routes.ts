import AddProfile from './routes/profiles/add';
import ManageProfiles from './routes/profiles/manage';
import Profiles from './routes/profiles';
import Login from './routes/login';

export default [
  { path: '/', file: 'routes/login.tsx' },
  { path: '/profiles', file: 'routes/profiles.tsx' },
  { path: '/profiles/add', file: 'routes/profiles/add.tsx' },
  { path: '/profiles/manage', file: 'routes/profiles/manage.tsx' },
];
