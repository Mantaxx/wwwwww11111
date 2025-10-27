#include "RoadFollowerPawn.h"
#include "Camera/CameraComponent.h"
#include "Components/InputComponent.h"
#include "RoadOfMastersActor.h"
#include "TimelineNode.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"

ARoadFollowerPawn::ARoadFollowerPawn()
{
    PrimaryActorTick.bCanEverTick = true;

    RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));

    CameraComponent = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
    CameraComponent->SetupAttachment(RootComponent);

    CurrentDistance = 0.f;
    CurrentSpeed = 0.f;
}

void ARoadFollowerPawn::BeginPlay()
{
    Super::BeginPlay();

    if (!RoadActor)
    {
        for (TActorIterator<ARoadOfMastersActor> It(GetWorld()); It; ++It)
        {
            RoadActor = *It;
            break;
        }
    }
}

void ARoadFollowerPawn::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);

    PlayerInputComponent->BindAxis(TEXT("MoveForward"), this, &ARoadFollowerPawn::MoveForward_Keyboard);
    PlayerInputComponent->BindAxis(TEXT("ScrollForward"), this, &ARoadFollowerPawn::MoveForward_Scroll);
    PlayerInputComponent->BindAxis(TEXT("Lean"), this, &ARoadFollowerPawn::LeanAxis);

    PlayerInputComponent->BindAxis("Turn", this, &APawn::AddControllerYawInput);
    PlayerInputComponent->BindAxis("LookUp", this, &APawn::AddControllerPitchInput);
}

void ARoadFollowerPawn::MoveForward_Keyboard(float Value) { InputForwardAxisKeyboard = FMath::Clamp(Value, -1.f, 1.f); }
void ARoadFollowerPawn::MoveForward_Scroll(float Value) { InputScrollDelta += Value; }
void ARoadFollowerPawn::LeanAxis(float Value) { InputLeanAxis = FMath::Clamp(Value, -1.f, 1.f); }

void ARoadFollowerPawn::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    if (bIsJumping)
    {
        JumpElapsed += DeltaSeconds;
        float Alpha = FMath::Clamp(JumpElapsed / JumpDuration, 0.f, 1.f);
        float SmoothAlpha = FMath::SmoothStep(0.f, 1.f, Alpha);
        CurrentDistance = FMath::Lerp(JumpStartDistance, JumpTargetDistance, SmoothAlpha);
        if (Alpha >= 1.f) { bIsJumping = false; CurrentSpeed = 0.f; }
    }
    else
    {
        ApplyMovement(DeltaSeconds);
    }

    // update transform based on spline position
    if (RoadActor && RoadActor->SplineComponent)
    {
        float SplineLen = RoadActor->SplineComponent->GetSplineLength();
        CurrentDistance = FMath::Clamp(CurrentDistance, 0.f, SplineLen);

        FVector TargetLoc = RoadActor->SplineComponent->GetLocationAtDistanceAlongSpline(CurrentDistance, ESplineCoordinateSpace::World);
        FRotator TargetRot = RoadActor->SplineComponent->GetRotationAtDistanceAlongSpline(CurrentDistance, ESplineCoordinateSpace::World);

        FVector RightVec = TargetRot.RotateVector(FVector::RightVector);
        static float CurrentLean = 0.f;
        float TargetLean = InputLeanAxis * MaxLeanOffset;
        CurrentLean = FMath::FInterpTo(CurrentLean, TargetLean, DeltaSeconds, LeanInterpSpeed);

        FVector FinalLoc = TargetLoc + RightVec * CurrentLean + FVector(0,0,20.f);
        SetActorLocation(FinalLoc);

        FRotator BankRot = TargetRot;
        float BankAngle = InputLeanAxis * -10.f;
        BankRot.Roll += BankAngle;
        SetActorRotation(BankRot);

        // node trigger check
        for (ATimelineNode* Node : RoadActor->TimelineNodes)
        {
            if (!IsValid(Node)) continue;
            // Only check nodes that haven't been triggered yet
            if (!Node->bHasTriggered)
            {
                constexpr float TriggerThreshold = 150.f;
                if (FMath::Abs(CurrentDistance - Node->DistanceOnSpline) <= TriggerThreshold)
                {
                    Node->HandlePassedByPawn(this);
                }
            }
        }
    }
}

void ARoadFollowerPawn::ApplyMovement(float DeltaTime)
{
    if (!RoadActor || !RoadActor->SplineComponent) return;

    // keyboard acceleration/braking
    if (InputForwardAxisKeyboard > 0.f)
    {
        CurrentSpeed += AccelerationRate * InputForwardAxisKeyboard * DeltaTime;
    }
    else if (InputForwardAxisKeyboard < 0.f)
    {
        CurrentSpeed -= BrakingRate * (-InputForwardAxisKeyboard) * DeltaTime;
    }
    else
    {
        CurrentSpeed = FMath::FInterpTo(CurrentSpeed, 0.f, DeltaTime, 1.5f);
    }

    if (FMath::Abs(InputScrollDelta) > KINDA_SMALL_NUMBER)
    {
        CurrentDistance += InputScrollDelta * ScrollSpeedMultiplier;
        InputScrollDelta = 0.f;
    }

    CurrentSpeed = FMath::Clamp(CurrentSpeed, -MaxSpeed, MaxSpeed);
    CurrentDistance += CurrentSpeed * DeltaTime;
}

void ARoadFollowerPawn::JumpToYear(int32 Year, bool bSmooth, float Duration)
{
    if (!RoadActor) return;
    float Target = -1.f;
    for (ATimelineNode* Node : RoadActor->TimelineNodes)
    {
        if (Node && Node->Year == Year)
        {
            Target = Node->DistanceOnSpline;
            break;
        }
    }
    if (Target < 0.f) return;

    if (!bSmooth || Duration <= 0.f)
    {
        CurrentDistance = Target;
        CurrentSpeed = 0.f;
        bIsJumping = false;
    }
    else
    {
        JumpStartDistance = CurrentDistance;
        JumpTargetDistance = Target;
        JumpDuration = Duration;
        JumpElapsed = 0.f;
        bIsJumping = true;
    }
}