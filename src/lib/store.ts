import { useState, useEffect } from 'react';
import { 
  Officer, DutySchedule, Facility, FireInspection, 
  FireEquipment, FireProtectionPlan, DocumentIncoming, 
  DocumentOutgoing, ReferenceMaterial, TaskWork, UserRole, User, RegistrationRequest 
} from '../types';
import { 
  INITIAL_OFFICERS, INITIAL_DUTY_SHEDULES, INITIAL_FACILITIES, 
  INITIAL_INSPECTIONS, INITIAL_EQUIPMENT, INITIAL_PLANS, 
  INITIAL_INCOMING_DOCS, INITIAL_OUTGOING_DOCS, INITIAL_MATERIALS, 
  INITIAL_TASKS 
} from '../data';
import { isFirebaseConfigured, db } from './firebase';
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, getDocsFromCache, getDocs 
} from 'firebase/firestore';

// Initial default users
const DEFAULT_USERS: User[] = [
  {
    id: 'USR_ADMIN_01',
    username: 'admin@pccc-tanan.gov.vn',
    email: 'admin@pccc-tanan.gov.vn',
    fullName: 'Ban Quản Trị Hệ Thống',
    role: 'Admin',
    dob: '1985-05-15',
    rank: 'Đại tá',
    password: 'Admin@2026',
    isLocked: false
  },
  {
    id: 'USR_PQB_1505',
    username: 'd31a.baopham1505@gmail.com',
    email: 'd31a.baopham1505@gmail.com',
    fullName: 'Phạm Quốc Bảo',
    role: 'Cán bộ phụ trách',
    dob: '1996-05-15',
    rank: 'Thượng úy',
    password: 'Baopham@2026',
    isLocked: false
  },
  {
    id: 'USR_CH_012',
    username: 'chihuy@pccc-tanan.gov.vn',
    email: 'chihuy@pccc-tanan.gov.vn',
    fullName: 'Hoàng Minh Hải',
    role: 'Chỉ huy',
    dob: '1980-12-25',
    rank: 'Thượng tá',
    password: 'Chihuy@2026',
    isLocked: false
  },
  {
    id: 'USR_CB_034',
    username: 'canbo@pccc-tanan.gov.vn',
    email: 'canbo@pccc-tanan.gov.vn',
    fullName: 'Nguyễn Trung Đức',
    role: 'Cán bộ phụ trách',
    dob: '1992-04-20',
    rank: 'Đại úy',
    password: 'Canbo@2026',
    isLocked: false
  }
];

export function usePCCCStore() {
  // Current logged in user context
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('pccc_current_user_v2');
    return cached ? JSON.parse(cached) : null;
  });

  // Database collections loaded as local state states
  const [users, setUsers] = useState<User[]>(() => {
    const cached = localStorage.getItem('pccc_users_auth');
    return cached ? JSON.parse(cached) : DEFAULT_USERS;
  });

  const [officers, setOfficers] = useState<Officer[]>(() => {
    const cached = localStorage.getItem('pccc_officers');
    return cached ? JSON.parse(cached) : INITIAL_OFFICERS;
  });

  const [schedules, setSchedules] = useState<DutySchedule[]>(() => {
    const cached = localStorage.getItem('pccc_schedules');
    return cached ? JSON.parse(cached) : INITIAL_DUTY_SHEDULES;
  });

  const [facilities, setFacilities] = useState<Facility[]>(() => {
    const cached = localStorage.getItem('pccc_facilities');
    return cached ? JSON.parse(cached) : INITIAL_FACILITIES;
  });

  const [inspections, setInspections] = useState<FireInspection[]>(() => {
    const cached = localStorage.getItem('pccc_inspections');
    return cached ? JSON.parse(cached) : INITIAL_INSPECTIONS;
  });

  const [equipment, setEquipment] = useState<FireEquipment[]>(() => {
    const cached = localStorage.getItem('pccc_equipment');
    return cached ? JSON.parse(cached) : INITIAL_EQUIPMENT;
  });

  const [plans, setPlans] = useState<FireProtectionPlan[]>(() => {
    const cached = localStorage.getItem('pccc_plans');
    return cached ? JSON.parse(cached) : INITIAL_PLANS;
  });

  const [incomingDocs, setIncomingDocs] = useState<DocumentIncoming[]>(() => {
    const cached = localStorage.getItem('pccc_incoming_docs');
    return cached ? JSON.parse(cached) : INITIAL_INCOMING_DOCS;
  });

  const [outgoingDocs, setOutgoingDocs] = useState<DocumentOutgoing[]>(() => {
    const cached = localStorage.getItem('pccc_outgoing_docs');
    return cached ? JSON.parse(cached) : INITIAL_OUTGOING_DOCS;
  });

  const [materials, setMaterials] = useState<ReferenceMaterial[]>(() => {
    const cached = localStorage.getItem('pccc_materials');
    return cached ? JSON.parse(cached) : INITIAL_MATERIALS;
  });

  const [tasks, setTasks] = useState<TaskWork[]>(() => {
    const cached = localStorage.getItem('pccc_tasks');
    return cached ? JSON.parse(cached) : INITIAL_TASKS;
  });

  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>(() => {
    const cached = localStorage.getItem('pccc_registration_requests');
    return cached ? JSON.parse(cached) : [];
  });

  // Local caching side effects
  useEffect(() => {
    localStorage.setItem('pccc_registration_requests', JSON.stringify(registrationRequests));
  }, [registrationRequests]);

  useEffect(() => {
    localStorage.setItem('pccc_current_user_v2', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pccc_users_auth', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('pccc_officers', JSON.stringify(officers));
  }, [officers]);

  useEffect(() => {
    localStorage.setItem('pccc_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('pccc_facilities', JSON.stringify(facilities));
  }, [facilities]);

  useEffect(() => {
    localStorage.setItem('pccc_inspections', JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem('pccc_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('pccc_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('pccc_incoming_docs', JSON.stringify(incomingDocs));
  }, [incomingDocs]);

  useEffect(() => {
    localStorage.setItem('pccc_outgoing_docs', JSON.stringify(outgoingDocs));
  }, [outgoingDocs]);

  useEffect(() => {
    localStorage.setItem('pccc_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('pccc_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Firestore Real-time Synchronization (If configured)
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    // Helper to sync arrays and auto-seed if bank collections are clean empty
    const syncCollection = (
      colName: string, 
      setLocalState: (data: any) => void, 
      initialData: any[]
    ) => {
      return onSnapshot(collection(db, colName), (snapshot) => {
        if (snapshot.empty) {
          // Sync state is empty on cloud! Write default dataset as seed
          console.log(`Seeding initial data collection: ${colName}`);
          initialData.forEach((item) => {
            setDoc(doc(db, colName, item.id || `MOCK_${Date.now()}`), item);
          });
        } else {
          const list: any[] = [];
          snapshot.forEach((d) => {
            list.push({ ...d.data(), id: d.id });
          });
          setLocalState(list);
        }
      });
    };

    // Instantiate listeners
    const unsubUsers = syncCollection('users', setUsers, DEFAULT_USERS);
    const unsubOfficers = syncCollection('officers', setOfficers, INITIAL_OFFICERS);
    const unsubSchedules = syncCollection('schedules', setSchedules, INITIAL_DUTY_SHEDULES);
    const unsubFacilities = syncCollection('facilities', setFacilities, INITIAL_FACILITIES);
    const unsubInspections = syncCollection('inspections', setInspections, INITIAL_INSPECTIONS);
    const unsubEquipment = syncCollection('equipment', setEquipment, INITIAL_EQUIPMENT);
    const unsubPlans = syncCollection('plans', setPlans, INITIAL_PLANS);
    const unsubInDocs = syncCollection('incomingDocs', setIncomingDocs, INITIAL_INCOMING_DOCS);
    const unsubOutDocs = syncCollection('outgoingDocs', setOutgoingDocs, INITIAL_OUTGOING_DOCS);
    const unsubMaterials = syncCollection('materials', setMaterials, INITIAL_MATERIALS);
    const unsubTasks = syncCollection('tasks', setTasks, INITIAL_TASKS);
    const unsubRegs = syncCollection('registrationRequests', setRegistrationRequests, []);

    // Turnoff triggers on unmount
    return () => {
      unsubUsers();
      unsubOfficers();
      unsubSchedules();
      unsubFacilities();
      unsubInspections();
      unsubEquipment();
      unsubPlans();
      unsubInDocs();
      unsubOutDocs();
      unsubMaterials();
      unsubTasks();
      unsubRegs();
    };
  }, []);

  // Write operation proxy helper (writes locally AND commits to cloud-synced FireStore)
  const commitWrite = async (colName: string, docId: string, payload: any, mode: 'create-update' | 'delete') => {
    if (isFirebaseConfigured && db) {
      try {
        if (mode === 'create-update') {
          await setDoc(doc(db, colName, docId), payload);
        } else {
          await deleteDoc(doc(db, colName, docId));
        }
      } catch (err) {
        console.error(`Firebase error committing write to ${colName}/${docId}:`, err);
      }
    }
  };

  // Auth logins
  const login = (fullName: string, role: UserRole) => {
    // Basic legacy compatibility fallback
    const mockEmail = fullName.toLowerCase().replace(/\s+/g, '') + '@pccc-tanan.gov.vn';
    setCurrentUser({
      id: 'USR_LEGACY',
      username: fullName,
      email: mockEmail,
      fullName,
      role,
      isLocked: false
    });
  };

  const loginWithEmail = (email: string, pass: string): { success: boolean; msg: string; user?: User } => {
    const match = users.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());
    if (!match) {
      return { success: false, msg: 'Tài khoản không tồn tại trên hệ thống.' };
    }
    if (match.isLocked) {
      return { success: false, msg: 'Tài khoản của bạn đã bị Khóa bởi Quản trị viên!' };
    }
    if (match.password !== pass) {
      return { success: false, msg: 'Mật khẩu xác thực không đúng. Vui lòng nhập lại.' };
    }

    setCurrentUser(match);
    return { success: true, msg: 'Đăng nhập thành công!', user: match };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Account Operations (Require Admin permission)
  const createUserAccount = async (usr: Omit<User, 'id'>) => {
    const id = `USR_${Date.now()}`;
    const newUser: User = { 
      ...usr, 
      id,
      username: usr.email || '',
      isLocked: !!usr.isLocked 
    };

    // Update locally first
    setUsers(prev => [...prev, newUser]);
    // Sync to Firestore
    await commitWrite('users', id, newUser, 'create-update');
  };

  const updateUserAccount = async (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    await commitWrite('users', updated.id, updated, 'create-update');

    // If updating currently logged in user, refresh context
    if (currentUser && currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const deleteUserAccount = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    await commitWrite('users', userId, null, 'delete');
  };

  // Wrapped State updaters to sync to Firestore on modification
  const syncHelper = async (colName: string, oldList: any[], newList: any[]) => {
    if (!isFirebaseConfigured || !db) return;
    try {
      const oldIds = oldList.map(x => x.id);
      const newIds = new Set(newList.map(x => x.id));
      const deletedIds = oldIds.filter(id => !newIds.has(id));

      // Propagate deletions
      for (const id of deletedIds) {
        await commitWrite(colName, id, null, 'delete');
      }
      // Propagate additions / edits
      for (const item of newList) {
        await commitWrite(colName, item.id, item, 'create-update');
      }
    } catch (err) {
      console.error(`Error in syncHelper for ${colName}:`, err);
    }
  };

  const updateOfficers = async (arg: Officer[] | ((prev: Officer[]) => Officer[])) => {
    const newVal = typeof arg === 'function' ? arg(officers) : arg;
    setOfficers(newVal);
    await syncHelper('officers', officers, newVal);
  };

  const updateSchedules = async (arg: DutySchedule[] | ((prev: DutySchedule[]) => DutySchedule[])) => {
    const newVal = typeof arg === 'function' ? arg(schedules) : arg;
    setSchedules(newVal);
    await syncHelper('schedules', schedules, newVal);
  };

  const updateFacilities = async (arg: Facility[] | ((prev: Facility[]) => Facility[])) => {
    const newVal = typeof arg === 'function' ? arg(facilities) : arg;
    setFacilities(newVal);
    await syncHelper('facilities', facilities, newVal);
  };

  const updateInspections = async (arg: FireInspection[] | ((prev: FireInspection[]) => FireInspection[])) => {
    const newVal = typeof arg === 'function' ? arg(inspections) : arg;
    setInspections(newVal);
    await syncHelper('inspections', inspections, newVal);
  };

  const updateEquipment = async (arg: FireEquipment[] | ((prev: FireEquipment[]) => FireEquipment[])) => {
    const newVal = typeof arg === 'function' ? arg(equipment) : arg;
    setEquipment(newVal);
    await syncHelper('equipment', equipment, newVal);
  };

  const updatePlans = async (arg: FireProtectionPlan[] | ((prev: FireProtectionPlan[]) => FireProtectionPlan[])) => {
    const newVal = typeof arg === 'function' ? arg(plans) : arg;
    setPlans(newVal);
    await syncHelper('plans', plans, newVal);
  };

  const updateIncomingDocs = async (arg: DocumentIncoming[] | ((prev: DocumentIncoming[]) => DocumentIncoming[])) => {
    const newVal = typeof arg === 'function' ? arg(incomingDocs) : arg;
    setIncomingDocs(newVal);
    await syncHelper('incomingDocs', incomingDocs, newVal);
  };

  const updateOutgoingDocs = async (arg: DocumentOutgoing[] | ((prev: DocumentOutgoing[]) => DocumentOutgoing[])) => {
    const newVal = typeof arg === 'function' ? arg(outgoingDocs) : arg;
    setOutgoingDocs(newVal);
    await syncHelper('outgoingDocs', outgoingDocs, newVal);
  };

  const updateMaterials = async (arg: ReferenceMaterial[] | ((prev: ReferenceMaterial[]) => ReferenceMaterial[])) => {
    const newVal = typeof arg === 'function' ? arg(materials) : arg;
    setMaterials(newVal);
    await syncHelper('materials', materials, newVal);
  };

  const updateTasks = async (arg: TaskWork[] | ((prev: TaskWork[]) => TaskWork[])) => {
    const newVal = typeof arg === 'function' ? arg(tasks) : arg;
    setTasks(newVal);
    await syncHelper('tasks', tasks, newVal);
  };

  const resetAllData = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại tất cả dữ liệu về mặc định năm 2026?')) {
      setOfficers(INITIAL_OFFICERS);
      setSchedules(INITIAL_DUTY_SHEDULES);
      setFacilities(INITIAL_FACILITIES);
      setInspections(INITIAL_INSPECTIONS);
      setEquipment(INITIAL_EQUIPMENT);
      setPlans(INITIAL_PLANS);
      setIncomingDocs(INITIAL_INCOMING_DOCS);
      setOutgoingDocs(INITIAL_OUTGOING_DOCS);
      setMaterials(INITIAL_MATERIALS);
      setTasks(INITIAL_TASKS);
      setUsers(DEFAULT_USERS);
      
      // Seed Firestore as well if online
      if (isFirebaseConfigured && db) {
        INITIAL_OFFICERS.forEach(o => commitWrite('officers', o.id, o, 'create-update'));
        INITIAL_DUTY_SHEDULES.forEach(s => commitWrite('schedules', s.id, s, 'create-update'));
        INITIAL_FACILITIES.forEach(f => commitWrite('facilities', f.id, f, 'create-update'));
        INITIAL_INSPECTIONS.forEach(i => commitWrite('inspections', i.id, i, 'create-update'));
        INITIAL_EQUIPMENT.forEach(e => commitWrite('equipment', e.id, e, 'create-update'));
        INITIAL_PLANS.forEach(p => commitWrite('plans', p.id, p, 'create-update'));
        INITIAL_INCOMING_DOCS.forEach(d => commitWrite('incomingDocs', d.id, d, 'create-update'));
        INITIAL_OUTGOING_DOCS.forEach(g => commitWrite('outgoingDocs', g.id, g, 'create-update'));
        INITIAL_MATERIALS.forEach(m => commitWrite('materials', m.id, m, 'create-update'));
        INITIAL_TASKS.forEach(t => commitWrite('tasks', t.id, t, 'create-update'));
        DEFAULT_USERS.forEach(u => commitWrite('users', u.id, u, 'create-update'));
      }
    }
  };

  const createRegistrationRequest = async (req: Omit<RegistrationRequest, 'id' | 'createdAt'>) => {
    const id = `REG_${Date.now()}`;
    const newReq: RegistrationRequest = {
      ...req,
      id,
      createdAt: new Date().toISOString()
    };
    
    setRegistrationRequests(prev => [...prev, newReq]);
    await commitWrite('registrationRequests', id, newReq, 'create-update');
  };

  const approveRegistrationRequest = async (reqId: string, customPayload?: Partial<User>) => {
    const req = registrationRequests.find(r => r.id === reqId);
    if (!req) return;

    // Create user account
    const id = `USR_${Date.now()}`;
    const newUser: User = {
      id,
      email: req.email,
      username: req.email,
      password: req.password || '123456',
      fullName: req.fullName,
      role: customPayload?.role || 'Cán bộ phụ trách',
      rank: customPayload?.rank || 'Thiếu úy',
      dob: customPayload?.dob || '',
      isLocked: false
    };

    setUsers(prev => [...prev, newUser]);
    await commitWrite('users', id, newUser, 'create-update');

    setRegistrationRequests(prev => prev.filter(r => r.id !== reqId));
    await commitWrite('registrationRequests', reqId, null, 'delete');
  };

  const rejectRegistrationRequest = async (reqId: string) => {
    setRegistrationRequests(prev => prev.filter(r => r.id !== reqId));
    await commitWrite('registrationRequests', reqId, null, 'delete');
  };

  return {
    currentUser,
    setCurrentUser,
    users,
    setUsers,
    registrationRequests,
    setRegistrationRequests,
    createRegistrationRequest,
    approveRegistrationRequest,
    rejectRegistrationRequest,
    login,
    loginWithEmail,
    logout,
    resetAllData,
    createUserAccount,
    updateUserAccount,
    deleteUserAccount,

    officers,
    setOfficers: updateOfficers,
    schedules,
    setSchedules: updateSchedules,
    facilities,
    setFacilities: updateFacilities,
    inspections,
    setInspections: updateInspections,
    equipment,
    setEquipment: updateEquipment,
    plans,
    setPlans: updatePlans,
    incomingDocs,
    setIncomingDocs: updateIncomingDocs,
    outgoingDocs,
    setOutgoingDocs: updateOutgoingDocs,
    materials,
    setMaterials: updateMaterials,
    tasks,
    setTasks: updateTasks,
    isFirebaseOnline: isFirebaseConfigured
  };
}

export type PCCCStoreType = ReturnType<typeof usePCCCStore>;
