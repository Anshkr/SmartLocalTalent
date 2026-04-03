export const MOCK_WORKERS = [
  { id: 1,  name: 'Ramesh Kumar',  email: 'ramesh@demo.com',  phone: '9876543210', skills: ['Painter','Mason'],       area: 'Sector 29',   rating: 4.9, jobs: 38, status: 'active',   joined: '10 Jan 2026', earnings: 42000 },
  { id: 2,  name: 'Suresh Yadav',  email: 'suresh@demo.com',  phone: '9876543211', skills: ['Carpenter','Painter'],   area: 'DLF Phase 2', rating: 4.7, jobs: 24, status: 'active',   joined: '15 Jan 2026', earnings: 28000 },
  { id: 3,  name: 'Mohan Lal',     email: 'mohan@demo.com',   phone: '9876543212', skills: ['Plumber','AC Repair'],   area: 'Sushant Lok', rating: 4.8, jobs: 51, status: 'active',   joined: '5 Feb 2026',  earnings: 63000 },
  { id: 4,  name: 'Deepak Singh',  email: 'deepak@demo.com',  phone: '9876543213', skills: ['Electrician'],           area: 'Palam Vihar', rating: 4.6, jobs: 17, status: 'active',   joined: '20 Feb 2026', earnings: 19000 },
  { id: 5,  name: 'Ganesh Nair',   email: 'ganesh@demo.com',  phone: '9876543214', skills: ['Gardener'],              area: 'Sector 14',   rating: 5.0, jobs: 12, status: 'pending',  joined: '1 Mar 2026',  earnings: 8400  },
  { id: 6,  name: 'Vijay Chauhan', email: 'vijay@demo.com',   phone: '9876543215', skills: ['Driver'],                area: 'MG Road',     rating: 4.5, jobs: 29, status: 'suspended',joined: '12 Jan 2026', earnings: 31000 },
  { id: 7,  name: 'Arjun Mehta',   email: 'arjun@demo.com',   phone: '9876543216', skills: ['Welder','Mason'],        area: 'Sector 56',   rating: 4.8, jobs: 20, status: 'active',   joined: '8 Feb 2026',  earnings: 26000 },
  { id: 8,  name: 'Pradeep Cook',  email: 'pradeep@demo.com', phone: '9876543217', skills: ['Cook'],                  area: 'Cyber City',  rating: 4.7, jobs: 15, status: 'pending',  joined: '10 Mar 2026', earnings: 0     },
]

export const MOCK_CUSTOMERS = [
  { id: 1, name: 'Priya Mehta',   email: 'priya@demo.com',   phone: '9999000001', area: 'Sector 29',   jobsHired: 5,  joined: '12 Jan 2026', status: 'active'    },
  { id: 2, name: 'Anil Kapoor',   email: 'anil@demo.com',    phone: '9999000002', area: 'DLF Phase 2', jobsHired: 3,  joined: '20 Jan 2026', status: 'active'    },
  { id: 3, name: 'Meena Joshi',   email: 'meena@demo.com',   phone: '9999000003', area: 'Sushant Lok', jobsHired: 8,  joined: '1 Feb 2026',  status: 'active'    },
  { id: 4, name: 'Raj Verma',     email: 'raj@demo.com',     phone: '9999000004', area: 'Palam Vihar', jobsHired: 2,  joined: '10 Feb 2026', status: 'active'    },
  { id: 5, name: 'Sunita Rawat',  email: 'sunita@demo.com',  phone: '9999000005', area: 'Sector 14',   jobsHired: 1,  joined: '5 Mar 2026',  status: 'blocked'   },
  { id: 6, name: 'Vikram Batra',  email: 'vikram@demo.com',  phone: '9999000006', area: 'MG Road',     jobsHired: 12, joined: '15 Jan 2026', status: 'active'    },
]

export const MOCK_JOBS = [
  { id: 1,  customer: 'Priya Mehta',  worker: 'Ramesh Kumar',  job: 'Paint 2 bedroom walls',    status: 'completed', date: '18 Mar 2026', amount: 1500, rating: 5  },
  { id: 2,  customer: 'Anil Kapoor',  worker: 'Suresh Yadav',  job: 'Fix wooden wardrobe',       status: 'active',    date: '21 Mar 2026', amount: 800,  rating: null},
  { id: 3,  customer: 'Meena Joshi',  worker: 'Mohan Lal',     job: 'Bathroom pipe repair',      status: 'completed', date: '15 Mar 2026', amount: 1200, rating: 4  },
  { id: 4,  customer: 'Raj Verma',    worker: 'Deepak Singh',  job: 'Ceiling fan installation',  status: 'pending',   date: '21 Mar 2026', amount: 400,  rating: null},
  { id: 5,  customer: 'Sunita Rawat', worker: 'Ganesh Nair',   job: 'Garden trimming',           status: 'completed', date: '10 Mar 2026', amount: 600,  rating: 5  },
  { id: 6,  customer: 'Vikram Batra', worker: 'Arjun Mehta',   job: 'Gate welding',              status: 'completed', date: '5 Mar 2026',  amount: 2200, rating: 5  },
  { id: 7,  customer: 'Priya Mehta',  worker: 'Suresh Yadav',  job: 'Bookshelf carpentry',       status: 'cancelled', date: '3 Mar 2026',  amount: 0,    rating: null},
  { id: 8,  customer: 'Meena Joshi',  worker: 'Ramesh Kumar',  job: 'Living room painting',      status: 'completed', date: '28 Feb 2026', amount: 3200, rating: 5  },
]

export const MOCK_DISPUTES = [
  { id: 1, customer: 'Sunita Rawat', worker: 'Vijay Chauhan', job: 'Driver for airport trip', issue: 'Worker did not arrive at the agreed time. I missed my flight.', date: '19 Mar 2026', status: 'open',     priority: 'high'   },
  { id: 2, customer: 'Anil Kapoor',  worker: 'Suresh Yadav',  job: 'Fix wooden wardrobe',     issue: 'Work quality is poor. The wardrobe door came loose again after 2 days.', date: '17 Mar 2026', status: 'open',     priority: 'medium' },
  { id: 3, customer: 'Raj Verma',    worker: 'Ramesh Kumar',  job: 'Paint exterior gate',     issue: 'Charged more than agreed. Asked for ₹1,500 but agreed was ₹1,000.', date: '10 Mar 2026', status: 'resolved', priority: 'medium' },
  { id: 4, customer: 'Meena Joshi',  worker: 'Deepak Singh',  job: 'Wiring repair',           issue: 'Worker was rude and unprofessional during the job.', date: '5 Mar 2026',  status: 'resolved', priority: 'low'    },
]