#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Pawn.h"
#include "RoadFollowerPawn.generated.h"

class UCameraComponent;
class ARoadOfMastersActor;
class ATimelineNode;

UCLASS()
class ARoadFollowerPawn : public APawn
{
    GENERATED_BODY()

public:
    ARoadFollowerPawn();

    virtual void Tick(float DeltaSeconds) override;
    virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;
    virtual void BeginPlay() override;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
    UCameraComponent* CameraComponent;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Movement")
    ARoadOfMastersActor* RoadActor;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Movement")
    float CurrentDistance = 0.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Movement")
    float CurrentSpeed = 0.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Movement")
    float MaxSpeed = 2000.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Movement")
    float AccelerationRate = 1000.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Movement")
    float BrakingRate = 1400.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Movement")
    float ScrollSpeedMultiplier = 500.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Movement")
    float MaxLeanOffset = 80.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Movement")
    float LeanInterpSpeed = 6.f;

    // Jump/tween variables
    UFUNCTION(BlueprintCallable, Category="Timeline")
    void JumpToYear(int32 Year, bool bSmooth = true, float Duration = 0.8f);

protected:
    float InputForwardAxisKeyboard = 0.f;
    float InputScrollDelta = 0.f;
    float InputLeanAxis = 0.f;

    // Jump vars
    float JumpStartDistance = 0.f;
    float JumpTargetDistance = 0.f;
    float JumpDuration = 0.8f;
    float JumpElapsed = 0.f;
    bool bIsJumping = false;

    void MoveForward_Keyboard(float Value);
    void MoveForward_Scroll(float Value);
    void LeanAxis(float Value);

    void ApplyMovement(float DeltaTime);
};