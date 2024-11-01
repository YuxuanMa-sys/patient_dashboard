import { Injectable } from '@angular/core';
import {
    Firestore,
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
    CollectionReference,
    DocumentReference,
    DocumentSnapshot,
    getDoc,
    setDoc,
    arrayUnion,
} from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { catchError, combineLatest, filter, finalize, forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
import moment from 'moment';


@Injectable({
    providedIn: 'root',
})
export class PatientService {
    constructor(
        private firestore: Firestore,
        private _httpClient: HttpClient,
        private storage: Storage
    ) { }

    addFamilyMember(patientId: string, memberData: any): Promise<void> {
        const familiesRef = collection(this.firestore, 'families');
        const familyDoc = doc(familiesRef, patientId); // Unique family doc per patient
        return updateDoc(familyDoc, { memberDetails: arrayUnion(memberData) });
      }

      getFamilyMembers(patientId: string): Observable<any[]> {
        return from(getDoc(doc(this.firestore, `families/${patientId}`))).pipe(
          map(docSnap => docSnap.exists() ? (docSnap.data().memberDetails || []) : [])
        );
      }

      updateFamilyMember(patientId: string, familyMemberId: string, updatedData: any): Promise<void> {
        const familyRef = doc(this.firestore, `families/${patientId}`);
        return getDoc(familyRef).then(snapshot => {
          if (snapshot.exists()) {
            const family = snapshot.data();
            const updatedMembers = (family.memberDetails || []).map(member =>
              member.id === familyMemberId ? { ...member, ...updatedData } : member
            );
            return updateDoc(familyRef, { memberDetails: updatedMembers });
          }
          throw new Error('Family not found');
        });
      }
    }
