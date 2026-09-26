/**
 * Password Reset Script
 * Resets a user's password in the database
 *
 * Usage: npx tsx scripts/reset-password.ts <email> <new-password>
 */

import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

async function resetPassword() {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.error('❌ Usage: npx tsx scripts/reset-password.ts <email> <new-password>');
    process.exit(1);
  }

  const [email, newPassword] = args;

  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database');

    console.log(`🔍 Looking up user: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ User found: ${user.name} (${user.email})`);

    // Update password - the pre-save hook will hash it automatically
    user.password = newPassword;
    await user.save();

    console.log('✅ Password reset successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New password: ${newPassword}`);
    console.log('\n🎉 You can now log in with the new password');

    process.exit(0);
  } catch (error) {
    console.error('💥 Error resetting password:', error);
    process.exit(1);
  }
}

resetPassword();
