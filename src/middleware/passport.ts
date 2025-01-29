import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User';

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: process.env.GITHUB_CALLBACK_URL as string,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          user = await User.create({
            githubId: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
          });
        }

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;