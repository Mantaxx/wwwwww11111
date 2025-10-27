#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "AchievementsTypes.h"
#include "RoadOfMastersActor.generated.h"

class USplineComponent;
class ATimelineNode;

UCLASS()
class ARoadOfMastersActor : public AActor
{
    GENERATED_BODY()

public:
    ARoadOfMastersActor();

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Road")
    USplineComponent* SplineComponent;

    // Node class to spawn (set to BP_TimelineNode)
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Timeline")
    TSubclassOf<ATimelineNode> TimelineNodeClass;

    // Data asset (optional) - will be created/filled by ParseTextAndBuildTimeline if null
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Timeline")
    UAchievementsDataAsset* AchievementsAsset = nullptr;

    // For placement along spline
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Timeline", meta=(ClampMin="0.0"))
    float TimelineStartDistance = 0.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Timeline", meta=(ClampMin="0.0"))
    float TimelineEndDistance = 0.f;

    // Raw text you paste into the Details panel; parser groups by year and builds nodes
    UPROPERTY(EditAnywhere, Category="Timeline", meta=(MultiLine=true))
    FString RawAchievementsText;

    // Spawned nodes
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Timeline")
    TArray<ATimelineNode*> TimelineNodes;

    // Editor callable build function
    UFUNCTION(CallInEditor, Category="Timeline")
    void ParseTextAndBuildTimeline();

protected:
    virtual void OnConstruction(const FTransform& Transform) override;
};