#include<stdio.h>

float chances(int n){
int back;
switch(n){
case 0:
  back=10;
  break;
case 1:
  back=20;
  break;
case 2:
  back = 40;
  break;
case 3 :
  back = 50;
  break;
case 4:
  back=60;
  break;
case 5:
  back=80;
  break;
case 6:
  back=100;
  break;
}
return back;
}

int main(){
int sub[6];
float total;
printf("enter total students");
scanf("%d",&total);
for(int i=0;i<6;i++){
scanf("%d",&sub[i]);
}
for( int i=0;i<6;i++){
int x = chances(i);
float year_back = (sub[i]/total)*100;
printf("%f percent students have %d chances of having year_back",year_back,x);
}
}
