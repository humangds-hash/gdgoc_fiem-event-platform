import { EventDetails } from "@/types/event";

// Compute an upcoming Friday at 3:00 PM IST (UTC+05:30)
const now = new Date();
const targetDate = new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000); // 18 days into the future
targetDate.setHours(15, 0, 0, 0);

const endDate = new Date(targetDate.getTime() + 2.5 * 60 * 60 * 1000); // 2.5 hours duration

export const initialEventData: EventDetails = {
  id: "gdg-study-jams-2026",
  title: "Study Jams Info Session 2026–27",
  tagline: "Initialize your Cloud Study Jams journey, explore pathway tracks, and mine up official GDG goodies.",
  communityName: "GDG on Campus Future Institute of Engineering & Management - Kolkata, India",
  bannerUrl:
    "https://res.cloudinary.com/startup-grind/image/upload/c_scale,w_2560/c_crop,h_640,w_2560,y_0.0_mul_h_sub_0.0_mul_640/c_crop,h_640,w_2560/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/event_banners/blob_vmPQdAw",
  thumbnailUrl:
    "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/blob_u1GwuXj",
  categoryTags: ["Google Cloud", "Career Development", "Tech Talk / Meetup"],
  audienceType: "IN_PERSON",

  startDate: targetDate.toISOString(),
  endDate: endDate.toISOString(),
  displayDate: targetDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  displayTime: "3:00 PM – 5:30 PM (IST)",
  timezone: "Asia/Kolkata (IST)",

  venueName: "Future Institute of Engineering and Management",
  hallOrRoom: "SG Hall, FIEM Campus",
  address: "Sonarpur Station Road, Rajpur Sonarpur",
  city: "Kolkata, West Bengal 700150",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Future+Institute+of+Engineering+and+Management+Sonarpur+Station+Road+Rajpur+Sonarpur+700150",

  capacity: 300,
  registeredCount: 253,
  isRegistrationOpen: true,
  isActive: true,
  status: "UPCOMING",

  aboutMarkdown: `The Study Jams are the most awaited events of the GDG on Campus. We say Study Jams, and we think goodies. Lots and lots of swags right from GDG's house.

This session is to initialise the **Cloud Study Jams 2026-2027**, by providing an introductory description to the audience, following which the team will guide the audience through the process of registering themselves in the Cloud Study Jams, and will walk them through the basics of all the details that they need to be aware of in order to successfully participate and complete the Study Jams.

And mine up all the goodies. Hands-on walkthrough, Google Cloud Skills Boost vouchers, and swag distributions will be covered in detail.`,

  perks: [
    "Official Google Cloud Skills Boost Access",
    "Tiered GDG Swag Kits, T-shirts & Goodies",
    "Hands-on Lab Guidance by Core Leads",
    "Recognized Digital Completion Certificates",
    "Networking with Tech Industry Mentors & High Tea",
  ],

  agenda: [
    {
      id: "a-1",
      timeSlot: "3:00 PM – 3:20 PM",
      title: "Check-in & Opening Address",
      description: "Welcome address by GDG on Campus organizers and overview of upcoming year milestones.",
      room: "SG Hall Main Stage",
      tag: "Community",
    },
    {
      id: "a-2",
      timeSlot: "3:20 PM – 4:00 PM",
      title: "Unveiling Cloud Study Jams 2026-27 Tracks",
      description: "Deep dive into GenAI, Cloud Computing, and Infrastructure pathways for students and beginners.",
      room: "SG Hall Main Stage",
      tag: "Google Cloud",
    },
    {
      id: "a-3",
      timeSlot: "4:00 PM – 4:45 PM",
      title: "Hands-on Skills Boost Onboarding & Lab Setup",
      description: "Live step-by-step registration on Google Cloud Skills Boost portal, voucher activations, and first quest completion.",
      room: "SG Hall Lab Deck",
      tag: "Workshop",
    },
    {
      id: "a-4",
      timeSlot: "4:45 PM – 5:15 PM",
      title: "Swags, Goodies & Milestone Roadmap 2026-27 & Q&A",
      description: "Showcasing completion criteria for exclusive badges, GDG t-shirts, backpacks, and bottles.",
      room: "SG Hall Main Stage",
      tag: "Perks & Swags",
    },
    {
      id: "a-5",
      timeSlot: "5:15 PM – 5:30 PM",
      title: "Networking, Photo Op & High Tea",
      description: "Meet the core team, connect with fellow student developers, and grab refreshments.",
      room: "Courtyard & Lounge",
      tag: "Networking",
    },
  ],

  team: [
    {
      id: "t-1",
      name: "Rishita Kundu",
      role: "GDGoC Organizer",
      organization: "Future Institute of Engineering and Management",
      avatarUrl:
        "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/rishita_kundu.png",
      bio: "Chapter Organizer leading GDG on Campus FIEM, passionate about fostering student tech innovations and cloud communities.",
      socials: {
        linkedin: "https://linkedin.com/in/rishita-kundu",
        twitter: "https://twitter.com/rishitakundu",
      },
      isFeatured: true,
    },
    {
      id: "t-2",
      name: "Arnab Das",
      role: "Core-Team Member",
      organization: "FIEM",
      avatarUrl:
        "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/arnab_das_8MfAxb2.JPG",
      bio: "Core-Team Member driving technical workshops and developer outreach.",
      socials: {
        linkedin: "https://linkedin.com/in/arnab-das-tech",
        twitter: "https://twitter.com/ARNAB_DAS_tech",
      },
      isFeatured: true,
    },
    {
      id: "t-3",
      name: "Shuvronil Mallick",
      role: "Core-Team Member",
      organization: "FIEM",
      avatarUrl:
        "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/shuvronil_mallick.jpeg",
      bio: "Core-Team Lead specializing in student enablement and community tech tracks.",
      socials: {
        linkedin: "https://linkedin.com/in/shuvronil-mallick",
        twitter: "https://twitter.com/shuvro14560",
      },
      isFeatured: true,
    },
    {
      id: "t-4",
      name: "Rupankar Dey",
      role: "Core-Team Member",
      organization: "FIEM",
      avatarUrl:
        "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/rupankar_dey.jpg",
      bio: "Developer Advocate and core facilitator for Cloud and AI study cohorts.",
      socials: {
        linkedin: "https://linkedin.com/in/rupankar-dey",
        twitter: "https://twitter.com/Rupankar_24",
      },
      isFeatured: true,
    },
    {
      id: "t-5",
      name: "Shuvam Dutta",
      role: "Core-Team Member",
      organization: "FIEM",
      avatarUrl:
        "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/shuvam_dutta_2agFJF3.jpg",
      bio: "Cloud builder and developer enthusiast mentoring students through labs.",
      socials: { twitter: "https://twitter.com/shuvamduttadev" },
    },
    {
      id: "t-6",
      name: "Bristi Sen",
      role: "Core-Team Member",
      organization: "FIEM",
      avatarUrl:
        "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/bristi_sen_OAAM4oO.jpg",
      bio: "Community coordinator orchestrating event operations and speaker relations.",
      socials: { twitter: "https://twitter.com/sen_bristi_" },
    },
    {
      id: "t-7",
      name: "Raunak Manna",
      role: "Core-Team Member",
      organization: "FIEM",
      avatarUrl:
        "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,h_250,q_auto:good,w_250/v1/gcs/platform-data-goog/contentbuilder/GDG-Bevy-DefaultProfile_xY7OLAZ.png",
      bio: "Core-team member focusing on student registrations and participant support.",
      socials: { twitter: "https://twitter.com/RaunakM298742" },
    },
    {
      id: "t-8",
      name: "Ankush Samanta",
      role: "Core-Team Member",
      organization: "FIEM",
      avatarUrl:
        "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/ankush_samanta.jpg",
      bio: "Logistics and technical coordination lead.",
    },
    {
      id: "t-9",
      name: "Snehasish Sadhukhan",
      role: "Core-Team Member",
      organization: "FIEM",
      avatarUrl:
        "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/snehasish_sadhukhan_SiZtWVy.jpg",
      bio: "Technical workshop support and cloud mentor.",
    },
    {
      id: "t-10",
      name: "Jitesh Prasad",
      role: "Core-Team Member",
      organization: "FIEM",
      avatarUrl:
        "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/jitesh_prasad_._al43LQM.jpg",
      bio: "Outreach lead and campus ambassador.",
    },
  ],
};

export const secondaryEventData: EventDetails = {
  id: "gdg-build-with-ai-2026",
  title: "Build with AI: Google I/O Extended 2026",
  tagline: "Explore Gemini 2.5, Google AI Studio, and build production agentic workflows with developer leads.",
  communityName: "GDG on Campus Future Institute of Engineering & Management - Kolkata, India",
  bannerUrl:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2000&q=80",
  thumbnailUrl:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
  categoryTags: ["AI / Machine Learning", "Gemini", "Workshop / Hackathon"],
  audienceType: "IN_PERSON",
  startDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
  displayDate: "Saturday, Nov 14, 2026",
  displayTime: "10:00 AM – 4:30 PM (IST)",
  timezone: "Asia/Kolkata (IST)",
  venueName: "Future Institute of Engineering and Management",
  hallOrRoom: "Auditorium & Innovation Labs",
  address: "Sonarpur Station Road, Rajpur Sonarpur",
  city: "Kolkata, West Bengal 700150",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Future+Institute+of+Engineering+and+Management+Sonarpur+Station+Road+Rajpur+Sonarpur+700150",
  capacity: 250,
  registeredCount: 142,
  isRegistrationOpen: true,
  isActive: true,
  status: "UPCOMING",
  aboutMarkdown: `Join us for the flagship **Build with AI: Google I/O Extended 2026** at FIEM Kolkata!

Dive deep into Google's latest advancements including **Gemini 2.5**, multimodal understanding, generative UI patterns, and hands-on AI code generation.

Work with industry mentors, compete for swag kits, and deploy real agentic apps!`,
  perks: [
    "Gemini API & Google AI Studio Access",
    "Limited Edition Google I/O Extended Swag & Stickers",
    "Hands-on Project Mentorship by GDG Leads",
    "Official Certificate of Participation",
    "Lunch & Refreshments included",
  ],
  agenda: [
    {
      id: "bio-1",
      timeSlot: "10:00 AM – 10:30 AM",
      title: "Keynote: What's New in Google AI & Gemini 2.5",
      description: "Overview of latest model capabilities, agentic coding, and tooling.",
      room: "Main Stage Auditorium",
      tag: "Keynote",
    },
    {
      id: "bio-2",
      timeSlot: "10:30 AM – 1:00 PM",
      title: "Hands-on Workshop: Building Multimodal Agents",
      description: "Build an interactive multimodal web app using the google-genai SDK.",
      room: "Innovation Labs",
      tag: "CodeLab",
    },
    {
      id: "bio-3",
      timeSlot: "2:00 PM – 4:30 PM",
      title: "Mini-Hackathon & Project Demos",
      description: "Showcase AI prototypes, voting, prize distributions, and closing networking.",
      room: "Main Stage Auditorium",
      tag: "Hackathon",
    },
  ],
  team: initialEventData.team.slice(0, 4),
};

export const pastEventData: EventDetails = {
  id: "gdg-cloud-community-day-2025",
  title: "Google Cloud Community Day Kolkata 2025",
  tagline: "Celebrating student builders, Kubernetes deployments, and cloud architectures at FIEM.",
  communityName: "GDG on Campus Future Institute of Engineering & Management - Kolkata, India",
  bannerUrl:
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2000&q=80",
  thumbnailUrl:
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
  categoryTags: ["Google Cloud", "DevOps", "Community Summit"],
  audienceType: "IN_PERSON",
  startDate: "2025-11-20T10:00:00Z",
  endDate: "2025-11-20T17:00:00Z",
  displayDate: "Saturday, Nov 20, 2025",
  displayTime: "10:00 AM – 5:00 PM (IST)",
  timezone: "Asia/Kolkata (IST)",
  venueName: "Future Institute of Engineering and Management",
  hallOrRoom: "Main Auditorium",
  address: "Sonarpur Station Road, Rajpur Sonarpur",
  city: "Kolkata, West Bengal 700150",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Future+Institute+of+Engineering+and+Management+Sonarpur+Station+Road+Rajpur+Sonarpur+700150",
  capacity: 350,
  registeredCount: 350,
  isRegistrationOpen: false,
  isActive: true,
  status: "PAST",
  aboutMarkdown: `A milestone community gathering where 350+ developers and students from across Kolkata joined us for full-day keynotes, GCP architecture deep-dives, and hands-on codelabs. Relive the sessions, photo galleries, and developer swags!`,
  perks: [
    "Full-Day Technical Sessions",
    "Exclusive Cloud Badges & Swags",
    "Networking Lunch & Refreshments",
  ],
  agenda: [
    {
      id: "p-1",
      timeSlot: "10:00 AM – 11:00 AM",
      title: "Keynote: Modern Cloud Architecture",
      description: "Opening keynote by Google Developer Experts.",
      room: "Main Auditorium",
      tag: "Keynote",
    },
    {
      id: "p-2",
      timeSlot: "11:00 AM – 1:00 PM",
      title: "Kubernetes & Microservices Workshop",
      description: "Deploying resilient workloads on GKE.",
      room: "Lab 3",
      tag: "Cloud",
    },
  ],
  team: initialEventData.team.slice(0, 3),
};

export const initialEventsList: EventDetails[] = [
  initialEventData,
  secondaryEventData,
  pastEventData,
];
