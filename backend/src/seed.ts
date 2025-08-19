import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@streaming.com' },
    update: {},
    create: {
      email: 'admin@streaming.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  // Create sample content
  const sampleContent = [
    {
      title: 'Sample Movie',
      description: 'A great sample movie for testing the streaming platform.',
      type: 'MOVIE' as const,
      genre: 'Action',
      releaseYear: 2023,
      duration: 120,
      videoUrl: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
      videoType: 'HLS' as const,
      posterUrl: 'https://via.placeholder.com/300x450/0066cc/ffffff?text=Sample+Movie',
      backdropUrl: 'https://via.placeholder.com/1920x1080/0066cc/ffffff?text=Sample+Movie'
    },
    {
      title: 'Sample Series',
      description: 'An exciting series with multiple episodes.',
      type: 'SERIES' as const,
      genre: 'Drama',
      releaseYear: 2023,
      videoUrl: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
      videoType: 'HLS' as const,
      posterUrl: 'https://via.placeholder.com/300x450/cc6600/ffffff?text=Sample+Series',
      backdropUrl: 'https://via.placeholder.com/1920x1080/cc6600/ffffff?text=Sample+Series'
    },
    {
      title: 'Sample Channel',
      description: 'A live streaming channel.',
      type: 'CHANNEL' as const,
      genre: 'Entertainment',
      releaseYear: 2024,
      videoUrl: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
      videoType: 'HLS' as const,
      posterUrl: 'https://via.placeholder.com/300x450/00cc66/ffffff?text=Sample+Channel',
      backdropUrl: 'https://via.placeholder.com/1920x1080/00cc66/ffffff?text=Sample+Channel'
    },
    {
      title: 'Comedy Special',
      description: 'Hilarious comedy special.',
      type: 'MOVIE' as const,
      genre: 'Comedy',
      releaseYear: 2024,
      duration: 90,
      videoUrl: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
      videoType: 'HLS' as const,
      posterUrl: 'https://via.placeholder.com/300x450/cc0066/ffffff?text=Comedy+Special',
      backdropUrl: 'https://via.placeholder.com/1920x1080/cc0066/ffffff?text=Comedy+Special'
    },
    {
      title: 'Documentary Series',
      description: 'Educational documentary series about nature.',
      type: 'SERIES' as const,
      genre: 'Documentary',
      releaseYear: 2022,
      videoUrl: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
      videoType: 'HLS' as const,
      posterUrl: 'https://via.placeholder.com/300x450/6600cc/ffffff?text=Documentary',
      backdropUrl: 'https://via.placeholder.com/1920x1080/6600cc/ffffff?text=Documentary'
    }
  ];

  for (const content of sampleContent) {
    const createdContent = await prisma.content.upsert({
      where: { title: content.title },
      update: {},
      create: content
    });

    // Add episodes for series
    if (content.type === 'SERIES') {
      for (let i = 1; i <= 3; i++) {
        await prisma.episode.upsert({
          where: { 
            id: `episode-${createdContent.id}-${i}`
          },
          update: {},
          create: {
            number: i,
            title: `Episode ${i}`,
            description: `Episode ${i} of ${content.title}`,
            duration: 45,
            videoUrl: content.videoUrl,
            videoType: content.videoType,
            contentId: createdContent.id
          }
        });
      }
    }
  }

  // Create a test user
  const testUserPassword = await bcrypt.hash('test123', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: testUserPassword,
      role: 'USER'
    }
  });

  // Create a profile for test user
  await prisma.profile.upsert({
    where: { 
      id: 'temp-id-for-upsert'
    },
    update: {},
    create: {
      name: 'Default Profile',
      userId: testUser.id,
      avatar: 'https://via.placeholder.com/100x100/333333/ffffff?text=U'
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📧 Admin email: admin@streaming.com`);
  console.log(`🔐 Admin password: admin123`);
  console.log(`📧 Test user email: test@example.com`);
  console.log(`🔐 Test user password: test123`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });